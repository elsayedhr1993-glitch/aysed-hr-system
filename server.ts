import { tokens } from "./src/design/tokens.ts";
import "./server/envBootstrap.ts";
import "./server/sentryServer.ts";
import express from "express";
import net from "net";
import path from "path";
import crypto from "crypto";
import zlib from "zlib";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { getFirestore, FieldPath } from "firebase-admin/firestore";
import { 
  sendWelcomeEmail, 
  sendAdminNewSubscriptionNotification,
  sendDailyBackupSuccessEmail,
  sendDailyBackupFailureAlert,
  getSystemDefaultEmail,
  BackupMetadata
} from "./src/services/emailService.ts";
import { 
  validateLeaveSettlement,
  cleanDuplicatePunches,
  runNightlyAudit
} from "./src/services/guards.ts";
import { 
  calculateServerFifoBalance, 
  calculateServerSettlement, 
  calculateServerWorkingDays,
  validateSettlementConstraints
} from "./server/leaveCalculatorServer.ts";
import { registerAiChatRoute } from "./server/aiChat.ts";
import { registerCopilotExecuteRoute } from "./server/copilotExecute.ts";
import { registerOcrScanRoute } from "./server/ocrScanRoute.ts";
import { registerLeaveApproveRoute } from "./server/leaveApproveRoute.ts";
import { handleAiTestKeyRequest } from "./server/aiTestKeyCore.ts";
import { requireFirebaseAuthFromHeader, resolveCallerRole } from "./server/apiAuth.ts";
import { applySecurityHeaders } from "./server/securityHeaders.ts";
import { createTenantScopeMiddleware } from "./server/tenantScope.ts";
import { localAuthWriteBypassEnabled } from "./server/localAuthBypass.ts";
import {
  devicePresentedFrom,
  recordUnregisteredDeviceAttempt,
  resolveRegisteredDeviceCompany,
} from "./server/deviceRegistry.ts";
import { newTenantCredentials, registerAuthRoutes } from "./server/authRoutes.ts";
import { registerAuditRoutes } from "./server/auditRoutes.ts";
import { registerReportsAccessRoute } from "./server/reportsAccessRoute.ts";
import { registerPlatformRoutes } from "./server/platformRoutes.ts";
import { registerSaasRoutes } from "./server/saasRoutes.ts";
import { registerStudioRoutes } from "./server/studioRoutes.ts";
import { recordAuditEvent, requestIp } from "./server/auditLog.ts";
import {
  getAdminApp,
  getAdminAuth,
  getAdminFirestore,
  hasFirebaseAdminCredentialEnv,
} from "./server/firebaseAdmin.ts";
import { getGeminiClient } from "./server/geminiServer.ts";
import { getConnectivityTestModels, getOcrModelCandidates } from "./src/config/aiConfig.ts";
import { parseJsonFromAiText } from "./src/utils/ocrJsonParse.ts";
import {
  generatePamContractPdfBytesFromTemplate,
  mergePamCoordinates,
  DEFAULT_PAM_COORDINATES,
  type PamContractData,
  type PamCoordinatesConfig,
  type PamFontChoice,
} from "./src/services/pamContractPdfService.ts";
import { loadPamFontBytesSync } from "./server/pamContractFonts.ts";

const app = express();

app.use((req, res, next) => {
  if (
    (req.path === '/api/auth/totp/confirm' || req.path === '/api/auth/change-password')
    && localAuthWriteBypassEnabled()
  ) {
    return next();
  }
  const emulatorOn = process.env.VITE_USE_EMULATOR === 'true' || Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (emulatorOn || process.env.ALLOW_PROD_WRITES === 'true') return next();
  const host = String(req.hostname || '').toLowerCase();
  const local = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (!local || req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  const memoryOnlyPosts = new Set([
    '/api/auth/login-guard',
    '/api/auth/login-failure',
    '/api/auth/login-success',
    '/api/auth/password-reset',
    '/api/auth/totp/verify',
    '/api/auth/session/touch',
    '/api/audit/identity-view',
    '/api/audit/events',
    '/api/audit/export',
  ]);
  if (memoryOnlyPosts.has(req.path)) return next();
  if (req.path.startsWith('/api/')) {
    res.status(403).json({
      error: 'localhost is read-only while it points at live data. Use npm run dev:emu, or set ALLOW_PROD_WRITES=true.',
    });
    return;
  }
  next();
});

const PREFERRED_PORT = Number(process.env.PORT) || 3000;

function findAvailablePort(startPort: number, host = "0.0.0.0", maxAttempts = 25): Promise<number> {
  return new Promise((resolve, reject) => {
    const attempt = (port: number) => {
      if (port - startPort >= maxAttempts) {
        reject(new Error(`No available port in range ${startPort}-${startPort + maxAttempts - 1}`));
        return;
      }
      const tester = net.createServer();
      tester.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          attempt(port + 1);
          return;
        }
        reject(err);
      });
      tester.once("listening", () => {
        tester.close(() => resolve(port));
      });
      tester.listen(port, host);
    };
    attempt(startPort);
  });
}

interface FacilityLicenseDoc {
  id?: string;
  nameAr?: string;
  nameEn?: string;
  commercialRegNo?: string;
  mohExpiryDate?: string;
  kffExpiryDate?: string;
  baladiyaExpiryDate?: string;
  lastUpdated?: string;
}

interface FacilityAuditResult {
  success: boolean;
  scannedCompanies: number;
  alertsCreated: number;
  alertsUpdated: number;
  skipped: number;
  errors: string[];
  executedAt: string;
}

// CORS and Preflight Request Handler for standalone link and external domain requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, prefer, range, x-api-key");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(applySecurityHeaders);
app.use(express.json({ limit: "25mb" }));
app.use(createTenantScopeMiddleware({
  requireAuth: async (req) => requireFirebaseAuthFromHeader(req.headers.authorization || req.headers.Authorization),
  resolveTenant: (auth) => resolveCallerRole(auth),
}));
registerAuthRoutes(app);
registerAuditRoutes(app);
registerReportsAccessRoute(app);
registerSaasRoutes(app);
registerPlatformRoutes(app);
registerStudioRoutes(app);

let supabaseAdminClient: any = null;
function getSupabaseAdmin() {
  if (supabaseAdminClient) return supabaseAdminClient;
  const rawUrl = process.env.VITE_SUPABASE_URL || 'https://ywukequruqkkwvqkvcia.supabase.co';
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !serviceKey.trim()) return null;

  supabaseAdminClient = createSupabaseClient(cleanUrl, serviceKey.trim(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return supabaseAdminClient;
}

const FACILITY_DOC_PREFIX = "facility_licensing_";
const FACILITY_ALERT_THRESHOLDS = [90, 30, 7];
const FACILITY_AUDIT_INTERVAL_MS = 6 * 60 * 60 * 1000;
let latestFacilityAuditResult: FacilityAuditResult | null = null;

function parseDateToMidnight(value?: string): Date | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) {
    return new Date(direct.getFullYear(), direct.getMonth(), direct.getDate());
  }

  const normalized = trimmed.replace(/\//g, "-").replace(/\./g, "-");
  const parts = normalized.split("-").map((p) => p.trim());
  if (parts.length !== 3) return null;

  let year = 0;
  let month = 0;
  let day = 0;
  if (parts[0].length === 4) {
    year = Number(parts[0]);
    month = Number(parts[1]);
    day = Number(parts[2]);
  } else if (parts[2].length === 4) {
    year = Number(parts[2]);
    month = Number(parts[1]);
    day = Number(parts[0]);
  } else {
    return null;
  }

  if (!year || !month || !day) return null;
  const out = new Date(year, month - 1, day);
  if (Number.isNaN(out.getTime())) return null;
  return out;
}

function toIsoDate(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildFacilityAlertMessage(companyName: string, label: string, daysRemaining: number, expiryDate: string): string {
  if (daysRemaining < 0) {
    return `انتهت صلاحية ${label} لمنشأة ${companyName} بتاريخ ${expiryDate}. يرجى التجديد فوراً لتجنب المخالفات.`;
  }
  return `متبقي ${daysRemaining} يوم على انتهاء ${label} لمنشأة ${companyName} بتاريخ ${expiryDate}.`;
}

async function runFacilityLicenseAudit(trigger = "AUTOMATED"): Promise<FacilityAuditResult> {
  const executedAt = new Date().toISOString();
  const admin = getAdminAuth();
  const adminApp = getAdminApp();
  if (!admin || !adminApp) {
    const fallback: FacilityAuditResult = {
      success: false,
      scannedCompanies: 0,
      alertsCreated: 0,
      alertsUpdated: 0,
      skipped: 0,
      errors: ["Firebase Admin غير مهيأ، تعذر تنفيذ تدقيق تراخيص المنشأة."],
      executedAt,
    };
    latestFacilityAuditResult = fallback;
    return fallback;
  }

  const result: FacilityAuditResult = {
    success: true,
    scannedCompanies: 0,
    alertsCreated: 0,
    alertsUpdated: 0,
    skipped: 0,
    errors: [],
    executedAt,
  };

  try {
    const adminDb = getFirestore(adminApp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayKey = toIsoDate(today);

    const facilitySnap = await adminDb
      .collection("system_config")
      .where(FieldPath.documentId(), ">=", FACILITY_DOC_PREFIX)
      .where(FieldPath.documentId(), "<", `${FACILITY_DOC_PREFIX}\uf8ff`)
      .get();

    for (const docSnap of facilitySnap.docs) {
      result.scannedCompanies += 1;
      const raw = docSnap.data() as FacilityLicenseDoc;
      const companyId = docSnap.id.replace(FACILITY_DOC_PREFIX, "") || "global";
      const companyName = raw.nameAr || raw.nameEn || companyId;

      const licenses = [
        { key: "moh", label: "ترخيص وزارة الصحة (MOH)", expiryDate: raw.mohExpiryDate || "" },
        { key: "kff", label: "ترخيص الإطفاء (KFF)", expiryDate: raw.kffExpiryDate || "" },
        { key: "baladiya", label: "ترخيص البلدية", expiryDate: raw.baladiyaExpiryDate || "" },
      ];

      for (const license of licenses) {
        const parsed = parseDateToMidnight(license.expiryDate);
        if (!parsed) {
          result.skipped += 1;
          continue;
        }

        const diffDays = Math.ceil((parsed.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const matchedThreshold = FACILITY_ALERT_THRESHOLDS.find((d) => diffDays === d);
        const isExpired = diffDays < 0;

        if (!matchedThreshold && !isExpired) {
          result.skipped += 1;
          continue;
        }

        const thresholdTag = isExpired ? "expired" : `${matchedThreshold}d`;
        const alertId = `facility_${companyId}_${license.key}_${thresholdTag}_${dayKey}`;
        const severity = isExpired ? "critical" : diffDays <= 7 ? "high" : diffDays <= 30 ? "medium" : "low";
        const payload = {
          id: alertId,
          type: "FACILITY_LICENSE_EXPIRY",
          category: "COMPLIANCE",
          companyId,
          companyName,
          licenseType: license.key,
          licenseLabel: license.label,
          expiryDate: toIsoDate(parsed),
          daysRemaining: diffDays,
          threshold: matchedThreshold || null,
          severity,
          status: "open",
          trigger,
          message: buildFacilityAlertMessage(companyName, license.label, diffDays, toIsoDate(parsed)),
          updatedAt: executedAt,
        };

        const alertRef = adminDb.collection("system_notifications").doc(alertId);
        const existing = await alertRef.get();
        if (existing.exists) {
          await alertRef.set(payload, { merge: true });
          result.alertsUpdated += 1;
        } else {
          await alertRef.set({
            ...payload,
            createdAt: executedAt,
          });
          result.alertsCreated += 1;
        }
      }
    }
  } catch (err: any) {
    result.success = false;
    result.errors.push(err?.message || "Facility audit failed");
  }

  latestFacilityAuditResult = result;
  return result;
}


// API Routes
app.get("/api/health", (req, res) => {
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.trim().length > 0);
  res.json({ 
    status: "ok", 
    system: "Aysed S HR 2026", 
    odooVersion: "Aysed HR",
    supabase: {
      url: (process.env.VITE_SUPABASE_URL || 'https://ywukequruqkkwvqkvcia.supabase.co').replace(/\/rest\/v1\/?$/, ''),
      hasServiceRole,
      hasAnonKey: Boolean(process.env.VITE_SUPABASE_ANON_KEY)
    }
  });
});

// Endpoint to verify Supabase Admin connection with Service Role Key
app.get("/api/supabase/status", async (req, res) => {
  try {
    const rawUrl = process.env.VITE_SUPABASE_URL || 'https://ywukequruqkkwvqkvcia.supabase.co';
    const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceKey || !serviceKey.trim()) {
      return res.json({
        configured: false,
        connected: false,
        message: "لم يتم العثور على مفتاح SUPABASE_SERVICE_ROLE_KEY في ملف .env",
      });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return res.status(500).json({
        configured: true,
        connected: false,
        message: "تعذر تهيئة عميل Supabase Admin",
      });
    }

    // Ping Supabase using service_role admin privileges
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (usersError) {
      return res.status(500).json({
        configured: true,
        connected: false,
        error: usersError.message,
        message: "فشل التحقق من صلاحيات مفتاح service_role",
      });
    }

    return res.json({
      configured: true,
      connected: true,
      projectUrl: cleanUrl,
      role: "service_role",
      userCountAud: usersData?.aud || "authenticated",
      message: "تم التحقق والربط بنجاح مع Supabase بمستوى صلاحيات service_role الإدارية الكاملة.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      configured: true,
      connected: false,
      error: err.message,
    });
  }
});

// =========================================================================
// 📡 BIOMETRIC DEVICES INTEGRATION ENDPOINTS (ZKTeco ADMS, PyZK, Hikvision)
// =========================================================================

// In-memory buffer for recent biometric device punches
const biometricLiveBuffer: Array<{
  id: string;
  pin: string;
  timestamp: string;
  status: string;
  source: string;
  companyId?: string;
  receivedAt: string;
}> = [];

async function registeredDeviceCompany(req: any): Promise<string | undefined> {
  const presented = devicePresentedFrom({
    query: req.query as Record<string, unknown>,
    body: req.body,
    headerToken: req.headers?.['x-device-token'],
  });
  const companyId = await resolveRegisteredDeviceCompany(presented);
  if (!companyId) recordUnregisteredDeviceAttempt(req.path, presented.serial);
  return companyId;
}

async function rejectUnregisteredDevice(req: any, res: any, asText = false) {
  await recordAuditEvent({
    actor: { uid: 'device', name: 'جهاز غير مسجل', role: 'UNKNOWN' },
    action: 'device_rejected',
    entityType: 'device',
    entityId: String(req?.path || ''),
    ip: requestIp(req || {}),
    sessionCompanyId: req?.sessionTenant?.companyId || '',
  });
  if (asText) return res.status(401).type('text/plain').send('Unauthorized');
  return res.status(401).json({ success: false, error: 'الجهاز غير مسجّل' });
}

// 1. ZKTeco ADMS Handshake (GET /iclock/cdata)
app.get("/iclock/cdata", async (req, res) => {
  const companyId = await registeredDeviceCompany(req);
  if (!companyId) return rejectUnregisteredDevice(req, res, true);
  const sn = req.query.SN || "UNKNOWN";
  console.log(`[Biometric ADMS Handshake] Device registered`);
  void companyId;
  res.send("GET OPTION FROM: " + sn + "\nATTLOGStamp=None\nOPERLOGStamp=None\nATTPHOTOStamp=None\nErrorDelay=30\nDelay=10\nTransTimes=00:00;14:00\nTransInterval=1\nTransFlag=1111000000\nRealtime=1\nEncrypt=0");
});

// 2. ZKTeco ADMS Real-time Data Push (POST /iclock/cdata)
app.post("/iclock/cdata", express.text({ type: "*/*" }), async (req, res) => {
  const companyId = await registeredDeviceCompany(req);
  if (!companyId) return rejectUnregisteredDevice(req, res, true);
  try {
    const rawData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const sn = (req.query.SN as string) || "ZKTeco-ADMS";
    console.log(`[Biometric ADMS Push] Incoming log from registered device:`, rawData.substring(0, 100));

    // Parse standard ZK tab-separated lines
    const lines = rawData.split(/\r?\n/);
    lines.forEach(line => {
      const parts = line.trim().split(/\t|\s{2,}/);
      if (parts.length >= 2) {
        const pin = parts[0].replace(/[^0-9a-zA-Z]/g, '');
        const timeStr = parts[1];
        if (pin && timeStr) {
          biometricLiveBuffer.unshift({
            id: `adms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            pin,
            timestamp: timeStr,
            status: parts[2] || '0',
            source: `ZKTeco (${sn})`,
            companyId,
            receivedAt: new Date().toISOString()
          });
        }
      }
    });

    if (biometricLiveBuffer.length > 200) {
      biometricLiveBuffer.length = 200;
    }

    // ZKTeco expects "OK" or "OK: count"
    res.send("OK");
  } catch (err: any) {
    console.error("[Biometric ADMS Push Error]", err);
    res.send("OK");
  }
});

// 3. Local Sync Agent / Webhook Endpoint (POST /api/biometrics/sync)
app.post("/api/biometrics/sync", express.json(), async (req, res) => {
  try {
    const companyId = await registeredDeviceCompany(req);
    if (!companyId) return rejectUnregisteredDevice(req, res);
    const { logs } = req.body;
    if (Array.isArray(logs)) {
      logs.forEach((log: any) => {
        biometricLiveBuffer.unshift({
          id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          pin: String(log.pin || log.user_id || ''),
          timestamp: log.timestamp || new Date().toISOString(),
          status: String(log.status || '0'),
          source: 'Local Agent (PyZK)',
          companyId,
          receivedAt: new Date().toISOString()
        });
      });
      if (biometricLiveBuffer.length > 200) {
        biometricLiveBuffer.length = 200;
      }
    }

    return res.json({
      status: "ok",
      received: Array.isArray(logs) ? logs.length : 0,
      message: `تم استلام ${Array.isArray(logs) ? logs.length : 0} سجل بصمة بنجاح في المنظومة السحابية`,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ status: "error", error: err.message });
  }
});

// 4. Biometric Hub Health & Live Buffer Query
app.get("/api/biometrics/health", (req, res) => {
  res.json({
    status: "online",
    service: "Aysed Biometrics Cloud Gateway",
    bufferedLogsCount: biometricLiveBuffer.length,
    recentPunches: biometricLiveBuffer.slice(0, 20),
    endpoints: {
      admsPush: "/iclock/cdata",
      agentSync: "/api/biometrics/sync",
      webhookPush: "/api/biometrics/push"
    },
    timestamp: new Date().toISOString()
  });
});

// Comprehensive Environment & Cloud Services Health Check Endpoint
app.get("/api/system/env-health", async (req, res) => {
  try {
    // 1. Supabase Verification
    const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ywukequruqkkwvqkvcia.supabase.co';
    const isCleanSupabaseUrl = !rawSupabaseUrl.includes('/rest/v1');
    const cleanSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    let supabasePingSuccess = false;
    let supabasePingMessage = '';
    try {
      const pingRes = await fetch(`${cleanSupabaseUrl}/auth/v1/settings`, {
        headers: {
          apikey: supabaseAnonKey || supabaseServiceKey,
          Authorization: `Bearer ${supabaseAnonKey || supabaseServiceKey}`,
        },
      });
      supabasePingSuccess = pingRes.ok;
      supabasePingMessage = pingRes.ok ? `HTTP ${pingRes.status} OK` : `HTTP ${pingRes.status} ${pingRes.statusText}`;
    } catch (e: any) {
      supabasePingMessage = e.message || 'فشل الاتصال';
    }

    // 2. Firebase Verification
    let firebaseProject = process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0326692360';
    let firestoreDb = 'ai-studio-remixaysedshr202-98c882d5-9491-4f4b-a838-c6b0b10a0472';
    const hasServiceAccount = Boolean(
      (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim().length > 0) ||
      (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
    );
    const adminReady = Boolean(getAdminAuth());

    // 3. UltraMsg WhatsApp Verification
    const ultraInstance = process.env.VITE_ULTRAMSG_INSTANCE_ID || process.env.ULTRAMSG_INSTANCE_ID || '';
    const ultraToken = process.env.VITE_ULTRAMSG_TOKEN || process.env.ULTRAMSG_TOKEN || '';
    const ultraBaseUrl = process.env.VITE_ULTRAMSG_BASE_URL || process.env.ULTRAMSG_BASE_URL || '';

    // 4. SMTP Verification
    const smtpUser = process.env.SMTP_USER || '';
    const hasSmtpPass = Boolean(process.env.SMTP_PASS && process.env.SMTP_PASS.trim().length > 0);
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT || 587;

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      supabase: {
        url: cleanSupabaseUrl,
        isCleanUrl: isCleanSupabaseUrl,
        hasAnonKey: Boolean(supabaseAnonKey && supabaseAnonKey.trim().length > 0),
        hasServiceRole: Boolean(supabaseServiceKey && supabaseServiceKey.trim().length > 0),
        livePing: {
          success: supabasePingSuccess,
          statusText: supabasePingMessage
        }
      },
      firebase: {
        projectId: firebaseProject,
        firestoreDatabaseId: firestoreDb,
        hasServiceAccount,
        adminReady
      },
      ultramsg: {
        instanceId: ultraInstance,
        hasToken: Boolean(ultraToken && ultraToken.trim().length > 0),
        baseUrl: ultraBaseUrl,
        configured: Boolean(ultraInstance && ultraToken)
      },
      smtp: {
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        hasPass: hasSmtpPass,
        configured: Boolean(smtpUser && hasSmtpPass)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ status: "error", error: err.message });
  }
});

// Test Gemini API Key endpoint for Settings / Admin Panel
app.post("/api/ai/test-key", async (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const result = await handleAiTestKeyRequest(authHeader as string | undefined);
  return res.status(result.status).json(result.body);
});

// ---------------------------------------------------------------------------
// ODOO ENTERPRISE CENTRAL LEAVE SSOT API (Backend Server-Side Calculations)
// ---------------------------------------------------------------------------

// 1. Calculate Single Employee FIFO Leave Balance & Accruals
app.post("/api/leave/calculate-balance", (req, res) => {
  try {
    const { employee, allocations = [], leaves = [], contract = null, asOfDate } = req.body;
    if (!employee || !employee.id) {
      return res.status(400).json({ success: false, error: "بيانات الموظف مطلوبة للحساب" });
    }

    const result = calculateServerFifoBalance(employee, allocations, leaves, contract, asOfDate);
    return res.json({
      success: true,
      data: result,
      source: "odoo-backend-ssot"
    });
  } catch (err: any) {
    console.error("[Leave Balance Backend Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Batch Calculate All Employees FIFO Leave Balances for Reports & Tables
app.post("/api/leave/batch-balances", (req, res) => {
  try {
    const { employees = [], allocations = [], leaves = [], contracts = [], asOfDate } = req.body;
    if (!Array.isArray(employees)) {
      return res.status(400).json({ success: false, error: "قائمة الموظفين غير صالحة" });
    }

    const contractMap = new Map<string, any>();
    contracts.forEach((c: any) => {
      if (c && c.employeeId) contractMap.set(c.employeeId, c);
    });

    const results: Record<string, any> = {};
    for (const emp of employees) {
      if (!emp || !emp.id) continue;
      const empContract = contractMap.get(emp.id) || null;
      results[emp.id] = calculateServerFifoBalance(emp, allocations, leaves, empContract, asOfDate);
    }

    return res.json({
      success: true,
      data: results,
      totalCount: Object.keys(results).length,
      source: "odoo-backend-ssot"
    });
  } catch (err: any) {
    console.error("[Batch Leave Balances Backend Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Central Comprehensive Settlement Calculation (Voucher & Encashment Engine)
app.post("/api/leave/calculate-settlement", (req, res) => {
  try {
    const params = req.body;
    if (!params.employee || !params.employee.id) {
      return res.status(400).json({ success: false, error: "بيانات الموظف مطلوبة لحساب التصفية" });
    }

    const result = calculateServerSettlement(params);
    const validation = validateSettlementConstraints({
      ...result,
      carriedOverBalance: result.carriedOverDays,
      accruedBalance: result.accrued2026Days,
      consumedLeaveDays: result.paidLeaveDays,
      remainingBalanceAfter: result.balanceAfter,
      basicSalary: result.basicSalary,
      dailyWage: result.dailyWage
    });

    return res.json({
      success: true,
      data: result,
      validation,
      source: "odoo-backend-ssot"
    });
  } catch (err: any) {
    console.error("[Leave Settlement Backend Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Odoo-style Constraint Validation Middleware for Settlement Vouchers & Approvals
app.post("/api/leave/validate-settlement", (req, res) => {
  try {
    const voucherOrInput = req.body;
    if (!voucherOrInput) {
      return res.status(400).json({ success: false, error: "بيانات التسوية مطلوبة للتحقق" });
    }

    const validation = validateSettlementConstraints(voucherOrInput);
    return res.json({
      success: true,
      data: validation,
      source: "odoo-backend-ssot"
    });
  } catch (err: any) {
    console.error("[Settlement Validation Backend Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Calculate Rest Day Exclusions (Fridays & Working Days)
app.post("/api/leave/working-days", (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = calculateServerWorkingDays(startDate, endDate);
    return res.json({
      success: true,
      data: result,
      source: "odoo-backend-ssot"
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// [1] الحارس اللحظي لتدقيق العمليات المالية والإجازات (Backend Guard)
app.post("/api/guards/validate-leave-settlement", (req, res) => {
  try {
    const data = req.body;
    const result = validateLeaveSettlement(data);
    return res.json({
      success: true,
      remaining: result.remaining,
      message: "تم التدقيق المالي والحسابي بنجاح"
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      error: err.message || "فشل التحقق من التسوية المالية"
    });
  }
});

// [2] محرك تنظيف البصمات المكررة والسجلات الزائدة (Punches De-duplication Guard)
app.post("/api/guards/clean-duplicate-punches", (req, res) => {
  try {
    const { punches } = req.body;
    if (!Array.isArray(punches)) {
      return res.status(400).json({ success: false, error: "يجب إرسال مصفوفة من البصمات punches" });
    }
    const cleaned = cleanDuplicatePunches(punches);
    return res.json({
      success: true,
      originalCount: punches.length,
      cleanedCount: cleaned.length,
      removedDuplicates: punches.length - cleaned.length,
      data: cleaned
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// [3] الحارس الدوري الليلي (Cron Job Health Check & Residency Audit)
app.all("/api/guards/nightly-audit", async (req, res) => {
  try {
    const nightlyAdminApp = getAdminApp();
    const db = nightlyAdminApp ? getFirestore(nightlyAdminApp) : null;
    const report = await runNightlyAudit(db);
    return res.json({
      success: true,
      report
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/guards/facility-license-audit/run", express.json(), async (req, res) => {
  try {
    const report = await runFacilityLicenseAudit("MANUAL_API");
    return res.json({ success: report.success, report });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "تعذر تشغيل تدقيق التراخيص" });
  }
});

app.get("/api/guards/facility-license-audit/status", async (req, res) => {
  return res.json({
    success: true,
    scheduler: {
      intervalMs: FACILITY_AUDIT_INTERVAL_MS,
      thresholdsDays: FACILITY_ALERT_THRESHOLDS,
      collection: "system_notifications",
    },
    latest: latestFacilityAuditResult,
  });
});

// Odoo Enterprise AI Copilot Chat Endpoint
async function requireFirebaseAuth(req: any, _res?: any) {
  const authHeader = req?.headers?.authorization || req?.headers?.Authorization;
  return requireFirebaseAuthFromHeader(authHeader);
}

async function requireSuperAdmin(req: any, _res?: any) {
  const authCheck = await requireFirebaseAuth(req);
  if (!authCheck.ok) {
    return authCheck;
  }

  const resolved = await resolveCallerRole(authCheck as any);
  if (resolved.role !== 'SUPER_ADMIN') {
    return {
      ok: false,
      error: 'Super Admin privileges required',
      status: 403,
      uid: (authCheck as any).uid,
    };
  }

  return {
    ...authCheck,
    role: 'SUPER_ADMIN',
    companyId: resolved.companyId,
  };
}

function rejectUnauthorized(res: any, authCheck: { error?: string; status?: number }) {
  return res.status(authCheck.status || 401).json({
    success: false,
    error: authCheck.error || 'Unauthorized',
  });
}

registerAiChatRoute(app, { requireFirebaseAuth, resolveCallerRole, getGeminiClient });
registerCopilotExecuteRoute(app);
registerOcrScanRoute(app);
registerLeaveApproveRoute(app);

// ---------------------------------------------------------------------------
// ZKTECO & BIOMETRIC REALTIME AUTO-SYNC API ENDPOINTS
// ---------------------------------------------------------------------------
const livePunchesCache: Array<{
  id: string;
  employeeCode: string;
  timestamp: string;
  date: string;
  time: string;
  type: 'IN' | 'OUT';
  deviceSn: string;
  receivedAt: string;
  companyId: string;
}> = [];

app.post("/api/attendance/live-push", async (req, res) => {
  try {
    const { punches, deviceSn } = req.body;
    const sessionCompanyId = await registeredDeviceCompany(req);
    if (!sessionCompanyId) return rejectUnregisteredDevice(req, res);
    const rawPunches = Array.isArray(punches) ? punches : [req.body];

    if (!rawPunches || rawPunches.length === 0) {
      return res.status(400).json({ success: false, error: "لا توجد سجلات بصمة مرسلة" });
    }

    const processedList: any[] = [];
    const nowIso = new Date().toISOString();

    for (const p of rawPunches) {
      const empCode = (p.employeeCode || p.pin || p.badgenumber || p.userId || p.empId || '').toString().trim();
      if (!empCode) continue;

      const rawTs = p.timestamp || p.time || p.date || p.datetime || nowIso;
      const parsedDateObj = new Date(rawTs);
      const isValidDate = !isNaN(parsedDateObj.getTime());

      const dateStr = isValidDate ? parsedDateObj.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const timeStr = isValidDate ? parsedDateObj.toTimeString().split(' ')[0].substring(0, 5) : '08:00';
      const typeStr = (p.type || p.status || p.punchType || 'IN').toString().toUpperCase().includes('OUT') ? 'OUT' : 'IN';
      const effCompId = sessionCompanyId;
      const effDevSn = deviceSn || p.deviceSn || p.sn || 'ZK-LOCAL-SYNC';

      const punchItem = {
        id: `punch-${empCode}-${dateStr}-${timeStr.replace(':', '')}-${Date.now()}`,
        employeeCode: empCode,
        timestamp: `${dateStr} ${timeStr}`,
        date: dateStr,
        time: timeStr,
        type: typeStr as 'IN' | 'OUT',
        deviceSn: effDevSn,
        receivedAt: nowIso,
        companyId: effCompId,
      };

      livePunchesCache.unshift(punchItem);
      if (livePunchesCache.length > 500) livePunchesCache.pop();
      processedList.push(punchItem);

      const liveAdminApp = getAdminApp();
      if (liveAdminApp) {
        try {
          const db = getFirestore(liveAdminApp);
          const attDocId = `att-live-${effCompId}-${empCode}-${dateStr}`;
          const attRef = db.collection("attendance").doc(attDocId);
          const snap = await attRef.get();

          if (snap.exists) {
            const existing = snap.data() || {};
            const updatePayload: any = {};
            if (typeStr === 'IN' && (!existing.checkIn || timeStr < existing.checkIn)) {
              updatePayload.checkIn = timeStr;
            } else if (typeStr === 'OUT' && (!existing.checkOut || timeStr > existing.checkOut)) {
              updatePayload.checkOut = timeStr;
            } else if (!existing.checkIn) {
              updatePayload.checkIn = timeStr;
            } else {
              updatePayload.checkOut = timeStr;
            }
            await attRef.update(updatePayload);
          } else {
            await attRef.set({
              id: attDocId,
              employeeId: empCode,
              employeeCode: empCode,
              companyId: effCompId,
              date: dateStr,
              checkIn: typeStr === 'IN' ? timeStr : undefined,
              checkOut: typeStr === 'OUT' ? timeStr : undefined,
              workHours: 8,
              status: 'PRESENT',
              lateMinutes: 0,
              earlyDepartureMinutes: 0,
              overtimeHours: 0,
              deviceSn: effDevSn,
              isLiveSynced: true,
              updatedAt: nowIso
            });
          }
        } catch (dbErr) {
          console.warn("[Live Attendance DB Sync Warning]:", dbErr);
        }
      }
    }

    return res.json({
      success: true,
      message: `تم معالجة وترحيل ${processedList.length} حركة بصمة لحظية بنجاح إلى النظام`,
      processedCount: processedList.length,
      latestPunches: processedList.slice(0, 10),
    });
  } catch (err: any) {
    console.error("[Live Attendance Push Error]:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.all(["/api/zkteco/iclock/cdata"], express.text({ type: "*/*" }), async (req, res) => {
  const sn = (req.query.SN || req.body?.SN || '').toString();
  const effCompId = await registeredDeviceCompany(req);
  if (!effCompId) return rejectUnregisteredDevice(req, res, true);

  if (req.method === 'GET') {
    res.setHeader("Content-Type", "text/plain");
    return res.send(`Registry=OK\nStamp=9999\nOpStamp=9999\nErrorDelay=60\nDelay=30\nTransTimes=00:00,23:59\nTransInterval=1\nTransFlag=1111110000\nTimeZone=3`);
  }

  const bodyText = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  console.log(`[ZKTeco ADMS Cloud Push] Incoming logs from registered device: ${bodyText.substring(0, 200)}`);

  let count = 0;

  try {
    const lines = bodyText.split(/\r?\n/).filter(l => l.trim().length > 0);
    const nowIso = new Date().toISOString();

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length >= 2) {
        const empCode = parts[0].trim();
        const punchTime = parts[1].trim(); // e.g. "2026-09-02 08:15:00"
        if (empCode && punchTime) {
          const dateStr = punchTime.split(' ')[0] || new Date().toISOString().split('T')[0];
          const timeStr = punchTime.split(' ')[1] || '08:00';

          const punchItem = {
            id: `zk-push-${empCode}-${dateStr}-${timeStr.replace(':', '')}-${Date.now()}`,
            employeeCode: empCode,
            timestamp: `${dateStr} ${timeStr}`,
            date: dateStr,
            time: timeStr,
            type: 'IN' as const,
            deviceSn: sn,
            receivedAt: nowIso,
            companyId: effCompId,
          };

          livePunchesCache.unshift(punchItem);
          if (livePunchesCache.length > 500) livePunchesCache.pop();

          const zkAdminApp = getAdminApp();
          if (effCompId && zkAdminApp) {
            const db = getFirestore(zkAdminApp);
            const attDocId = `att-live-${effCompId}-${empCode}-${dateStr}`;
            const attRef = db.collection("attendance").doc(attDocId);
            const snap = await attRef.get();
            if (!snap.exists) {
              await attRef.set({
                id: attDocId,
                employeeId: empCode,
                employeeCode: empCode,
                companyId: effCompId,
                date: dateStr,
                checkIn: timeStr,
                workHours: 8,
                status: 'PRESENT',
                deviceSn: sn,
                isLiveSynced: true,
                updatedAt: nowIso
              });
            }
          }
          count++;
        }
      }
    }
  } catch (err) {
    console.error("[ZKTeco Cloud Push Parse Error]:", err);
  }

  res.setHeader("Content-Type", "text/plain");
  return res.send(`OK: ${count}`);
});

app.get("/api/attendance/live-logs", async (req, res) => {
  const compId = await registeredDeviceCompany(req);
  if (!compId) return rejectUnregisteredDevice(req, res);
  const filtered = livePunchesCache.filter(p => p.companyId === compId);
  return res.json({
    success: true,
    totalCount: filtered.length,
    punches: filtered,
  });
});

// Live WhatsApp API Gateway Route (UltraMsg / Custom WhatsApp Gateway)
app.post("/api/send-whatsapp", async (req, res) => {
  try {
    const { instanceId, apiToken, token, to, body, message, serverUrl, priority } = req.body;
    const effectiveToken = apiToken || token || process.env.VITE_ULTRAMSG_TOKEN || process.env.WHATSAPP_API_TOKEN || "mh21qnlb8vngnkml";
    const effectiveInstanceId = instanceId || process.env.VITE_ULTRAMSG_INSTANCE_ID || process.env.WHATSAPP_INSTANCE_ID || "instance188430";
    const messageBody = body || message;

    if (!effectiveToken || effectiveToken.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "مفتاح التوثيق السري (API Token) مطلوب لإرسال رسائل الواتساب. يرجى إدخاله في شاشة إعدادات الربط.",
        errorCode: "MISSING_TOKEN"
      });
    }

    if (!to || to.toString().trim() === "") {
      return res.status(400).json({
        success: false,
        error: "رقم هاتف المستلم مطلوب لإرسال الرسالة.",
        errorCode: "MISSING_PHONE"
      });
    }

    if (!messageBody || messageBody.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "نص الرسالة مطلوب.",
        errorCode: "MISSING_BODY"
      });
    }

    // Clean and format recipient phone number for Kuwait & International standards
    let cleanPhone = to.toString().trim().replace(/[^\d+]/g, "");
    if (cleanPhone.startsWith("+")) {
      cleanPhone = cleanPhone.substring(1);
    }
    // If local 8-digit Kuwait number, prepend 965
    if (cleanPhone.length === 8 && !cleanPhone.startsWith("965")) {
      cleanPhone = "965" + cleanPhone;
    }

    // Determine target WhatsApp Gateway URL (Default to UltraMsg)
    let targetEndpoint = serverUrl && serverUrl.trim() !== "" ? serverUrl.trim() : "";
    if (!targetEndpoint) {
      targetEndpoint = `https://api.ultramsg.com/${effectiveInstanceId.trim()}/messages/chat`;
    } else if (!targetEndpoint.includes("/messages/chat") && targetEndpoint.includes("ultramsg.com")) {
      targetEndpoint = targetEndpoint.replace(/\/+$/, "") + "/messages/chat";
    }

    console.log(`[WhatsApp API] Sending real message to ${cleanPhone} via endpoint: ${targetEndpoint}`);

    // Create form payload for UltraMsg / WhatsApp Gateway
    const formParams = new URLSearchParams();
    formParams.append("token", effectiveToken.trim());
    formParams.append("to", cleanPhone);
    formParams.append("body", messageBody);
    if (priority) {
      formParams.append("priority", priority.toString());
    }

    // Timeout controller (15 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let gatewayResponse: Response;
    try {
      gatewayResponse = await fetch(targetEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "User-Agent": "Aysed-HR-WhatsApp-Client/2026"
        },
        body: formParams,
        signal: controller.signal
      });
    } catch (networkErr: any) {
      clearTimeout(timeoutId);
      if (networkErr.name === "AbortError") {
        return res.status(504).json({
          success: false,
          error: "انتهت مهلة الاتصال ببوابة الواتساب (Request Timeout - 15s). يرجى التأكد من حالة خادم الواتساب.",
          errorCode: "TIMEOUT"
        });
      }
      return res.status(502).json({
        success: false,
        error: `فشل الاتصال بالإنترنت أو بخادم بوابة الواتساب: ${networkErr.message}`,
        errorCode: "NETWORK_ERROR"
      });
    }

    clearTimeout(timeoutId);

    // Parse gateway response
    const responseText = await gatewayResponse.text();
    let responseData: any = {};
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { rawResponse: responseText };
    }

    // Check for UltraMsg & REST errors
    if (!gatewayResponse.ok) {
      const errorMsg = responseData.error || responseData.message || responseText || `HTTP ${gatewayResponse.status}`;
      return res.status(gatewayResponse.status >= 400 && gatewayResponse.status < 600 ? gatewayResponse.status : 400).json({
        success: false,
        error: `خطأ من بوابة الواتساب: ${errorMsg}`,
        details: responseData,
        statusCode: gatewayResponse.status
      });
    }

    // UltraMsg returns 200 with { error: "invalid token" } or { error: "..." } in some error cases
    if (responseData.error) {
      return res.status(400).json({
        success: false,
        error: `رفضت بوابة الواتساب الطلب: ${responseData.error}`,
        details: responseData,
        errorCode: "GATEWAY_REJECTED"
      });
    }

    return res.json({
      success: true,
      data: responseData,
      messageId: responseData.id || responseData.messageId || `wpp_${Date.now()}`,
      phone: `+${cleanPhone}`,
      timestamp: new Date().toISOString(),
      message: "تم إرسال رسالة الواتساب الحقيقية بنجاح إلى الهاتف!"
    });
  } catch (err: any) {
    console.error("[WhatsApp Server Error]:", err);
    return res.status(500).json({
      success: false,
      error: `حدث خطأ داخلي أثناء معالجة الإرسال: ${err.message || 'Unknown Error'}`,
      errorCode: "INTERNAL_ERROR"
    });
  }
});

// SMTP / Email Route
app.post("/api/send-email", express.json(), async (req, res) => {
  const { to, subject, text, html, smtpHost, smtpPort, smtpUser, smtpPass } = req.body;

  // Resolve config dynamically with fallbacks
  const resolvedHost = smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
  const resolvedPort = Number(smtpPort) || Number(process.env.SMTP_PORT) || 465;
  const resolvedUser = smtpUser || process.env.SMTP_USER || "elsayedhr1993@gmail.com";
  const resolvedPass = smtpPass || process.env.SMTP_PASS || "";

  // Secure is true for port 465, false for 587 or 25
  const resolvedSecure = resolvedPort === 465;

  try {
    const transporter = nodemailer.createTransport({
      host: resolvedHost,
      port: resolvedPort,
      secure: resolvedSecure,
      auth: {
        user: resolvedUser,
        pass: resolvedPass,
      },
      connectionTimeout: 4000, // 4 seconds timeout to fail faster than proxy
      greetingTimeout: 4000,
      socketTimeout: 4000,
    });

    await transporter.sendMail({
      from: resolvedUser,
      to,
      subject,
      text,
      html
    });

    res.json({ success: true, message: "تم إرسال البريد بنجاح (Email sent successfully)" });
  } catch (error: any) {
    console.error("Email send failed:", error);
    
    // Check for common SMTP errors and make them very readable
    let userFriendlyError = error.message || "حدث خطأ غير معروف في خادم البريد.";
    if (error.code === 'ETIMEDOUT' || error.syscall === 'connect') {
      userFriendlyError = `تأخر خادم البريد في الاستجابة (Timeout). يرجى التأكد من صحة خادم البريد [${resolvedHost}] والمنفذ [${resolvedPort}] وأنه غير محجوب بجدار حماية.`;
    } else if (error.code === 'EAUTH' || error.message.includes('auth') || error.message.includes('Auth')) {
      userFriendlyError = `فشل المصادقة والتوثيق (SMTP Authentication Failed). يرجى التأكد من البريد الإلكتروني ورمز التطبيق (App Password) المكون من 16 حرفاً في حال استخدام Gmail.`;
    }

    // Always return a JSON response with status 200/500 depending on success: false
    res.status(200).json({ 
      success: false, 
      error: userFriendlyError,
      technicalError: error.message,
      code: error.code 
    });
  }
});

// ---------------------------------------------------------------------------
// AUTOMATED SYSTEM DATABASE BACKUP & SMTP DISPATCH ENGINE
// ---------------------------------------------------------------------------
interface BackupHistoryRecord {
  backupId: string;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  recordsCount: number;
  sizeFormatted: string;
  filename: string;
  durationMs: number;
  error?: string;
}

let latestBackupBuffer: Buffer | null = null;
let latestBackupFilename = "aysed_hr_latest_db_dump.json.gz";
let latestBackupMetadata: BackupMetadata | null = null;
const backupHistory: BackupHistoryRecord[] = [];

async function executeSystemBackupCore(clientSnapshot?: any, triggerSource = 'MANUAL'): Promise<{
  success: boolean;
  metadata?: BackupMetadata;
  filename?: string;
  error?: string;
  alertSent?: boolean;
  durationMs: number;
}> {
  const startTime = Date.now();
  const backupId = `bkp_${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)}_${Math.random().toString(36).slice(2, 6)}`;
  const dateStr = new Date().toLocaleDateString('ar-KW', { timeZone: 'Asia/Kuwait' });
  const timestampStr = new Date().toLocaleString('ar-KW', { timeZone: 'Asia/Kuwait' });
  const systemEmail = getSystemDefaultEmail();

  try {
    let dumpCollections: Record<string, any[]> = {};
    let collectionStats: Record<string, number> = {};
    let totalRecords = 0;

    // 1. If Firestore Admin is initialized on server, dump directly from Firestore
    const backupAdminApp = getAdminApp();
    if (backupAdminApp) {
      try {
        const db = getFirestore(backupAdminApp);
        const colNames = [
          'companies', 'employees', 'contracts', 'leave_requests', 'leave_allocations',
          'leave_settlements', 'attendance', 'payslips', 'payroll_runs',
          'custody_loans', 'daily_movements', 'commencements', 'documents',
          'res_config_settings', 'subscription_requests', 'audit_logs', 'system_integrations'
        ];
        for (const col of colNames) {
          const snap = await db.collection(col).get();
          const items: any[] = [];
          snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
          dumpCollections[col] = items;
          collectionStats[col] = items.length;
          totalRecords += items.length;
        }
      } catch (adminDbErr) {
        console.warn("[Backup Server Firestore Warning]:", adminDbErr);
      }
    }

    // 2. If client snapshot was supplied and has more data, merge/prefer it
    if (clientSnapshot && clientSnapshot.collections) {
      for (const [colName, items] of Object.entries(clientSnapshot.collections)) {
        if (Array.isArray(items) && (items.length > 0 || !dumpCollections[colName])) {
          dumpCollections[colName] = items;
          collectionStats[colName] = items.length;
        }
      }
      totalRecords = Object.values(collectionStats).reduce((acc, curr) => acc + curr, 0);
    }

    // Include system live cache & memory metadata
    dumpCollections['system_live_punches'] = livePunchesCache;
    collectionStats['system_live_punches'] = livePunchesCache.length;
    totalRecords += livePunchesCache.length;

    const fullDumpPayload = {
      _meta: {
        system: "Aysed S HR 2026",
        version: "Aysed HR",
        backupId,
        createdAt: new Date().toISOString(),
        timeZone: "Asia/Kuwait",
        triggerSource,
        totalCollections: Object.keys(dumpCollections).length,
        totalRecords,
      },
      collections: dumpCollections,
    };

    const jsonString = JSON.stringify(fullDumpPayload, null, 2);
    const uncompressedSizeBytes = Buffer.byteLength(jsonString, 'utf8');

    // Compress using GZIP
    const compressedBuffer = zlib.gzipSync(Buffer.from(jsonString, 'utf8'));
    const compressedSizeBytes = compressedBuffer.length;

    // Cryptographic Checksum SHA-256
    const sha256Checksum = crypto.createHash('sha256').update(compressedBuffer).digest('hex');

    const durationMs = Date.now() - startTime;

    const metadata: BackupMetadata = {
      backupId,
      timestamp: timestampStr,
      dateStr,
      durationMs,
      environment: process.env.NODE_ENV || 'production',
      totalCollections: Object.keys(dumpCollections).length,
      totalRecords,
      uncompressedSizeBytes,
      compressedSizeBytes,
      sha256Checksum,
      collectionStats,
      databaseName: 'ai-studio-remixaysedshr202-98c882d5-9491-4f4b-a838-c6b0b10a0472'
    };

    const filename = `aysed_hr_db_dump_${new Date().toISOString().split('T')[0]}_${backupId}.json.gz`;

    // Cache latest buffer
    latestBackupBuffer = compressedBuffer;
    latestBackupFilename = filename;
    latestBackupMetadata = metadata;

    // Send Daily Backup Success Email with attached compressed DB Dump file
    const emailResult = await sendDailyBackupSuccessEmail({
      metadata,
      dumpPayloadJson: fullDumpPayload,
      compressedBuffer,
      recipientEmail: systemEmail,
    });

    const formatBytes = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (emailResult.success) {
      backupHistory.unshift({
        backupId,
        timestamp: timestampStr,
        status: 'SUCCESS',
        recordsCount: totalRecords,
        sizeFormatted: formatBytes(compressedSizeBytes),
        filename,
        durationMs,
      });
      if (backupHistory.length > 50) backupHistory.pop();

      return {
        success: true,
        metadata,
        filename,
        durationMs,
      };
    } else {
      throw new Error(`تعذر تسليم الإيميل: ${emailResult.error || 'SMTP Error'}`);
    }
  } catch (err: any) {
    console.error("[Backup Core Failure]:", err);
    const durationMs = Date.now() - startTime;

    // Record failure in history
    backupHistory.unshift({
      backupId,
      timestamp: timestampStr,
      status: 'FAILED',
      recordsCount: 0,
      sizeFormatted: '0 KB',
      filename: 'N/A',
      durationMs,
      error: err.message,
    });
    if (backupHistory.length > 50) backupHistory.pop();

    // Trigger Immediate Urgent Failure Alert Email
    let alertSent = false;
    try {
      const alertResult = await sendDailyBackupFailureAlert({
        error: err.message || 'Unknown technical backup failure',
        errorStack: err.stack,
        failedStep: 'محرك تفريغ البيانات والضغط والإرسال البريدي',
        timestamp: timestampStr,
        recipientEmail: systemEmail,
      });
      alertSent = alertResult.success;
    } catch (alertErr) {
      console.error("[Backup Alert Dispatch Failure]:", alertErr);
    }

    return {
      success: false,
      error: err.message,
      alertSent,
      durationMs,
    };
  }
}

// 1. Manual or Client-triggered Backup Run
app.post("/api/backup/run", express.json({ limit: "50mb" }), async (req, res) => {
  try {
    const authCheck = await requireSuperAdmin(req);
    if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

    const { snapshot } = req.body || {};
    const result = await executeSystemBackupCore(snapshot, 'MANUAL_TRIGGER');
    if (result.success) {
      return res.json({
        success: true,
        message: "تم أخذ النسخة الاحتياطية المضغوطة وإرسال التقرير والملف المرفق بنجاح إلى إيميل النظام المعتمد",
        metadata: result.metadata,
        filename: result.filename,
        durationMs: result.durationMs,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || "فشل أخذ النسخة الاحتياطية",
        alertSent: result.alertSent,
        durationMs: result.durationMs,
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Test Failure Alert Simulation Route
app.post("/api/backup/test-failure-alert", express.json(), async (req, res) => {
  try {
    const authCheck = await requireSuperAdmin(req);
    if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

    const { error, failedStep, errorStack } = req.body || {};
    const systemEmail = getSystemDefaultEmail();
    const result = await sendDailyBackupFailureAlert({
      error: error || 'محاكاة اختبارية: تعذر الاتصال بقرص تخزين النسخ الاحتياطية (Simulated Backup Storage Failure)',
      failedStep: failedStep || 'فحص واختبار التنبيهات العاجلة للأعطال',
      errorStack: errorStack || 'Error: Simulated failure alert triggered from Admin Dashboard to test immediate SMTP delivery\n    at backupController (server.ts:1050)',
      recipientEmail: systemEmail,
    });

    if (result.success) {
      return res.json({
        success: true,
        message: `تم إرسال تنبيه العطل الفوري بنجاح إلى إيميل النظام المعتمد (${systemEmail})`,
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || "فشل إرسال تنبيه العطل",
      });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Backup Engine Status & History API
app.get("/api/backup/status", async (req, res) => {
  const authCheck = await requireSuperAdmin(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);
  const systemEmail = getSystemDefaultEmail();
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const lastSuccessful = backupHistory.find(h => h.status === 'SUCCESS');
  const lastItem = backupHistory[0];

  return res.json({
    isEnabled: true,
    systemDefaultEmail: systemEmail,
    schedule: 'Daily at 00:00 (Asia/Kuwait)',
    lastRun: lastItem ? {
      backupId: lastItem.backupId,
      timestamp: lastItem.timestamp,
      status: lastItem.status,
      recordsCount: lastItem.recordsCount,
      compressedSize: lastItem.sizeFormatted,
      filename: lastItem.filename,
      error: lastItem.error,
    } : (latestBackupMetadata ? {
      backupId: latestBackupMetadata.backupId,
      timestamp: latestBackupMetadata.timestamp,
      status: 'SUCCESS',
      recordsCount: latestBackupMetadata.totalRecords,
      compressedSize: formatBytes(latestBackupMetadata.compressedSizeBytes),
      filename: latestBackupFilename,
    } : null),
    totalBackupsRun: backupHistory.length,
    history: backupHistory,
    hasCachedDump: latestBackupBuffer !== null,
    latestFilename: latestBackupFilename,
  });
});

// 4. Download Latest Backup Dump File API
app.get("/api/backup/download-latest", async (req, res) => {
  const authCheck = await requireSuperAdmin(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

  if (!latestBackupBuffer) {
    return res.status(404).json({ success: false, error: "لا توجد نسخة احتياطية محفوظة حالياً في الذاكرة. يرجى تشغيل النسخ أولاً." });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${latestBackupFilename}"`);
  res.setHeader("Content-Type", "application/gzip");
  res.setHeader("Content-Length", latestBackupBuffer.length);
  return res.send(latestBackupBuffer);
});

// Schedule Automated Silent Daily Backup in Server Background
// Runs every 24 hours (86,400,000 ms), with an initial background trigger after 45 seconds of uptime
const DAILY_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

setTimeout(() => {
  console.log("[Auto-Backup Scheduler] Executing initial automated daily backup run...");
  executeSystemBackupCore(undefined, 'AUTOMATED_DAILY_CRON')
    .then(res => {
      if (res.success) {
        console.log(`[Auto-Backup Scheduler] Initial daily backup completed successfully. ID: ${res.metadata?.backupId}`);
      } else {
        console.warn(`[Auto-Backup Scheduler] Initial backup warning: ${res.error}`);
      }
    })
    .catch(err => {
      console.error("[Auto-Backup Scheduler] Exception during initial backup:", err);
    });
}, 45000);

setInterval(() => {
  console.log("[Auto-Backup Scheduler] Running daily automatic backup and email dispatch...");
  executeSystemBackupCore(undefined, 'AUTOMATED_DAILY_CRON')
    .then(res => {
      if (res.success) {
        console.log(`[Auto-Backup Scheduler] Daily backup email dispatched successfully.`);
      }
    })
    .catch(err => {
      console.error("[Auto-Backup Scheduler] Failed automated daily backup:", err);
    });
}, DAILY_BACKUP_INTERVAL_MS);

setTimeout(() => {
  console.log("[Facility License Scheduler] Running initial facility license compliance audit...");
  runFacilityLicenseAudit("INITIAL_BOOT")
    .then((report) => {
      if (report.success) {
        console.log(`[Facility License Scheduler] Initial audit done. companies=${report.scannedCompanies}, created=${report.alertsCreated}, updated=${report.alertsUpdated}`);
      } else {
        console.warn(`[Facility License Scheduler] Initial audit warning: ${report.errors.join(' | ')}`);
      }
    })
    .catch((err) => {
      console.error("[Facility License Scheduler] Initial audit failed:", err);
    });
}, 60000);

setInterval(() => {
  console.log("[Facility License Scheduler] Running periodic facility license compliance audit...");
  runFacilityLicenseAudit("AUTOMATED_INTERVAL")
    .then((report) => {
      if (report.success) {
        console.log(`[Facility License Scheduler] Audit done. companies=${report.scannedCompanies}, created=${report.alertsCreated}, updated=${report.alertsUpdated}`);
      } else {
        console.warn(`[Facility License Scheduler] Audit warning: ${report.errors.join(' | ')}`);
      }
    })
    .catch((err) => {
      console.error("[Facility License Scheduler] Audit failed:", err);
    });
}, FACILITY_AUDIT_INTERVAL_MS);

// Welcome Email Route for Subscription
app.post("/api/send-welcome-email", express.json(), async (req, res) => {
  const { subscriberEmail, subscriberName, companyName } = req.body;
  if (!subscriberEmail || !subscriberName || !companyName) {
    return res.status(400).json({ success: false, error: "جميع الحقول (subscriberEmail, subscriberName, companyName) مطلوبة" });
  }
  try {
    const result = await sendWelcomeEmail({ subscriberEmail, subscriberName, companyName });
    if (result.success) {
      res.json({ success: true, message: "تم إرسال إيميل الترحيب بنجاح" });
    } else {
      res.status(500).json({ success: false, error: result.error || "فشل إرسال الإيميل" });
    }
  } catch (error: any) {
    console.error("Welcome email route error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Comprehensive Subscription Registration & Notification Endpoint
app.post("/api/subscription/register", express.json(), async (req, res) => {
  const { requesterName, companyName, email, phone, empCount, planType } = req.body;
  
  if (!companyName || !phone) {
    return res.status(400).json({ success: false, error: "اسم الشركة ورقم الهاتف مطلوبان" });
  }

  const reqName = requesterName || companyName;
  const reqEmail = email || `${phone.replace(/[^0-9]/g, '')}@aysedhr.com`;
  const reqEmpCount = empCount || "1-10";
  const reqPlanType = planType || "medical";

  console.log(`[Subscription Register] Received request from: ${companyName} (${reqName}), Phone: ${phone}, Email: ${reqEmail}`);

  // 1. Notify Super Admin (elsayedhr1993@gmail.com)
  let adminNotified = false;
  try {
    const adminEmailResult = await sendAdminNewSubscriptionNotification({
      requesterName: reqName,
      companyName,
      email: reqEmail,
      phone,
      empCount: reqEmpCount,
      planType: reqPlanType,
    });
    adminNotified = adminEmailResult.success;
  } catch (err) {
    console.warn("[Subscription Register] Admin notification warning:", err);
  }

  // 2. Send Welcome Email to Subscriber if valid email provided
  let subscriberWelcomed = false;
  if (email && email.includes("@") && !email.includes("@aysedhr.com")) {
    try {
      const welcomeResult = await sendWelcomeEmail({
        subscriberEmail: email.trim(),
        subscriberName: reqName,
        companyName,
      });
      subscriberWelcomed = welcomeResult.success;
    } catch (err) {
      console.warn("[Subscription Register] Subscriber welcome email warning:", err);
    }
  }

  return res.json({
    success: true,
    message: "تم استلام وتسجيل طلب الاشتراك بنجاح وإشعار الإدارة العليا",
    adminNotified,
    subscriberWelcomed,
  });
});


app.post("/api/admin/set-tenant-active", express.json(), async (req, res) => {
  const authCheck = await requireSuperAdmin(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

  const email = String(req.body?.email || "").trim().toLowerCase();
  const active = req.body?.active !== false;

  if (!email) {
    return res.status(400).json({ success: false, error: "البريد الإلكتروني مطلوب" });
  }

  const admin = getAdminAuth();
  if (!admin) {
    return res.status(400).json({ success: false, error: "Firebase Admin is not configured" });
  }

  try {
    const userRecord = await admin.getUserByEmail(email);
    await admin.updateUser(userRecord.uid, { disabled: !active });
    await recordAuditEvent({
      actor: {
        uid: req.sessionTenant?.uid || 'platform',
        name: req.sessionTenant?.email || 'platform',
        role: req.sessionTenant?.role || 'SUPER_ADMIN',
      },
      action: 'update',
      entityType: 'facility',
      entityId: email,
      after: { active, status: active ? 'active' : 'suspended' },
      ip: requestIp(req),
      sessionCompanyId: req.sessionTenant?.companyId || '',
    });
    return res.json({
      success: true,
      message: active ? "تم تفعيل حساب المنشأة في Auth" : "تم تعليق حساب المنشأة في Auth",
    });
  } catch (error: any) {
    if (error?.code === "auth/user-not-found") {
      return res.json({ success: false, error: "auth/user-not-found" });
    }
    console.error("set-tenant-active failed:", error);
    return res.status(500).json({ success: false, error: error.message || "فشل تحديث حالة الحساب" });
  }
});

app.post("/api/admin/force-password", express.json(), async (req, res) => {
  const authCheck = await requireSuperAdmin(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

  const { email, newPassword } = req.body;
  const admin = getAdminAuth();
  if (!admin) {
    return res.status(400).json({ 
      success: false, 
      error: "Firebase Admin is not configured or private key is invalid. Please ensure FIREBASE_SERVICE_ACCOUNT in Secrets contains a valid Service Account JSON." 
    });
  }
  
  try {
    const userRecord = await admin.getUserByEmail(email);
    await admin.updateUser(userRecord.uid, { password: newPassword });
    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error: any) {
    console.error("Force password change failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Route to Create or Sync Tenant Account seamlessly without overriding Super Admin session
app.post("/api/admin/create-tenant", express.json(), async (req, res) => {
  const authCheck = await requireSuperAdmin(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

  const { email, companyName, newCompanyId } = req.body;
  const issued = newTenantCredentials();
  const boundCompanyId = String(newCompanyId || '').trim() || issued.companyId;
  
  if (!email || !companyName) {
    return res.status(400).json({ success: false, error: "البريد الإلكتروني واسم الشركة مطلوبان" });
  }

  const admin = getAdminAuth();
  const cleanEmail = email.trim().toLowerCase();
  let uid = `user_${Date.now()}`;
  let alreadyExisted = false;

  if (admin) {
    try {
      try {
        const existingUser = await admin.getUserByEmail(cleanEmail);
        uid = existingUser.uid;
        alreadyExisted = true;
        await admin.updateUser(uid, { displayName: companyName });
      } catch (notFoundErr: any) {
        if (notFoundErr.code === 'auth/user-not-found') {
          const newUser = await admin.createUser({
            email: cleanEmail,
            password: issued.temporaryPassword,
            displayName: companyName,
            emailVerified: true
          });
          uid = newUser.uid;
        } else {
          throw notFoundErr;
        }
      }

      // Set custom claims for role
      try {
        await admin.setCustomUserClaims(uid, {
          role: 'COMPANY_ADMIN',
          companyId: boundCompanyId,
          mustChangePassword: !alreadyExisted
        });
      } catch (claimErr) {
        console.warn("Custom claims note:", claimErr);
      }

      await recordAuditEvent({
        actor: {
          uid: req.sessionTenant?.uid || 'platform',
          name: req.sessionTenant?.email || 'platform',
          role: req.sessionTenant?.role || 'SUPER_ADMIN',
        },
        action: 'create',
        entityType: 'facility',
        entityId: boundCompanyId,
        after: { status: 'active' },
        ip: requestIp(req),
        sessionCompanyId: req.sessionTenant?.companyId || '',
      });
      return res.json({
        success: true,
        uid,
        companyId: boundCompanyId,
        temporaryPassword: alreadyExisted ? undefined : issued.temporaryPassword,
        mustChangePassword: !alreadyExisted,
        alreadyExisted,
        message: alreadyExisted ? "تم ربط الحساب الموجود وتحديث بيانات الدخول" : "تم إنشاء حساب المستخدم في Firebase Auth بنجاح"
      });
    } catch (adminErr: any) {
      console.error("Admin create user error:", adminErr);
      return res.status(500).json({ success: false, error: adminErr.message });
    }
  } else {
    // If Firebase Admin is not configured, inform client so it can use secondary client auth instance
    return res.json({
      success: false,
      useClientFallback: true,
      message: "Firebase Admin is not configured, falling back to secondary client app"
    });
  }
});

// Admin Route to Hard Delete a Tenant User from Firebase Authentication
app.post("/api/admin/delete-tenant", express.json(), async (req, res) => {
  const authCheck = await requireSuperAdmin(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

  const { email, uid, companyId } = req.body;
  const admin = getAdminAuth();

  if (!email && !uid) {
    return res.status(400).json({ success: false, error: "البريد الإلكتروني أو معرف المستخدم مطلوب" });
  }

  if (admin) {
    let targetUid = uid;
    try {
      if (!targetUid && email) {
        try {
          const userRecord = await admin.getUserByEmail(email.trim().toLowerCase());
          targetUid = userRecord.uid;
        } catch (notFoundErr: any) {
          if (notFoundErr.code === 'auth/user-not-found') {
            return res.json({ success: true, message: "لم يتم العثور على حساب مستخدم في Auth، تم الاستمرار بالحذف" });
          }
          throw notFoundErr;
        }
      }

      if (targetUid) {
        await admin.deleteUser(targetUid);
      }

      await recordAuditEvent({
        actor: {
          uid: req.sessionTenant?.uid || 'platform',
          name: req.sessionTenant?.email || 'platform',
          role: req.sessionTenant?.role || 'SUPER_ADMIN',
        },
        action: 'delete',
        entityType: 'facility',
        entityId: String(email || uid || ''),
        after: { archived: true },
        ip: requestIp(req),
        sessionCompanyId: req.sessionTenant?.companyId || '',
      });
      return res.json({
        success: true,
        message: "تم حذف حساب مسؤول الشركة من Firebase Authentication بنجاح"
      });
    } catch (adminErr: any) {
      console.error("Admin delete tenant auth error:", adminErr);
      return res.status(500).json({ success: false, error: adminErr.message });
    }
  } else {
    return res.json({
      success: true,
      useClientFallback: true,
      message: "Firebase Admin is not configured, client-side handles database and storage purge"
    });
  }
});

app.post("/api/admin/update-user-email", express.json(), async (req, res) => {
  const authCheck = await requireFirebaseAuth(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

  const { currentEmail, newEmail } = req.body;
  const admin = getAdminAuth();
  if (!admin) {
    return res.status(400).json({ 
      success: false, 
      error: "Firebase Admin is not configured" 
    });
  }

  const resolved = await resolveCallerRole(authCheck as any);
  const callerEmail = String((authCheck as any).email || '').toLowerCase();
  const targetCurrent = String(currentEmail || '').trim().toLowerCase();
  if (resolved.role !== 'SUPER_ADMIN' && callerEmail !== targetCurrent) {
    return res.status(403).json({ success: false, error: 'يمكنك تعديل بريد حسابك فقط' });
  }
  
  try {
    const userRecord = await admin.getUserByEmail(currentEmail);
    await admin.updateUser(userRecord.uid, { email: newEmail });
    res.json({ success: true, message: "تم تحديث البريد الإلكتروني بنجاح" });
  } catch (error: any) {
    console.error("Update email failed in admin:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// System Settings & 2FA OTP Backend APIs (Odoo HR Core)
// ============================================================================
let systemSettingsStore = {
  id: 1,
  company_name_ar: '',
  company_name_en: '',
  commercial_reg_no: '',
  civil_id_org: '',
  pasi_number: '',
  currency: 'KWD',
  official_email: '',
  phone: '',
  address: '',
  enable_kuwait_wps: true,
  wps_bank_code: 'NBK',
  enable_biometric_api: true,
  biometric_device_ip: '',
  biometric_port: '4370',
  enable_email_smtp: false,
  smtp_host: '',
  smtp_port: '587',
  smtp_user: '',
  auto_backup_enabled: true,
  backup_frequency: 'daily',
  backup_time: '02:00',
  retain_backups_days: 30,
  export_format: 'sql_zip',
  enable_email_2fa: true,
  otp_expiry_minutes: 5,
  session_timeout_minutes: 60,
  enforce_strong_password: true,
  trust_device_days: 30,
  system_theme: 'light',
  primary_color: tokens.color.primary,
  sidebar_style: 'odoo-compact',
  show_company_logo_on_print: true,
  header_margin_top: 48,
  updated_at: new Date().toISOString()
};

let multiCompanySettings: Record<string, typeof systemSettingsStore> = {};

interface UserOtpRecord {
  id: number;
  user_id: string | number;
  otp_code: string;
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
}
const userOtpCodesStore: UserOtpRecord[] = [];
let otpIdCounter = 1;

// 1. GET Settings
app.get("/api/settings", async (req, res) => {
  const authCheck = await requireFirebaseAuth(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);
  const companyId = req.sessionTenant?.companyId || `session:${req.sessionTenant?.uid || 'none'}`;
  if (!multiCompanySettings[companyId]) {
    multiCompanySettings[companyId] = {
      ...systemSettingsStore,
    };
  }
  res.json({ success: true, data: multiCompanySettings[companyId] });
});

// 2. PUT Settings
app.put("/api/settings", express.json(), async (req, res) => {
  try {
    const authCheck = await requireFirebaseAuth(req);
    if (!authCheck.ok) return rejectUnauthorized(res, authCheck);
    const companyId = req.sessionTenant?.companyId || `session:${req.sessionTenant?.uid || 'none'}`;
    const data = req.body;
    if (!multiCompanySettings[companyId]) {
      multiCompanySettings[companyId] = { ...systemSettingsStore };
    }
    multiCompanySettings[companyId] = {
      ...multiCompanySettings[companyId],
      ...data,
      updated_at: new Date().toISOString()
    };
    res.json({ success: true, message: "تم تحديث الإعدادات بنجاح", data: multiCompanySettings[companyId] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "فشل تحديث الإعدادات", error: error.message });
  }
});

// Endpoint: توليد عقد العمل الحكومي (نموذج 2 - الهيئة العامة للقوى العاملة) سحابياً
app.post("/api/generate-pam-contract", express.json(), async (req, res) => {
  try {
    const body = req.body as PamContractData & {
      coords?: Partial<PamCoordinatesConfig>;
      fontChoice?: PamFontChoice;
    };
    const { coords: reqCoords, fontChoice = "cairo", ...data } = body;
    const fs = await import("fs");

    const templatePath = path.join(process.cwd(), "public", "pam_contract_form_2.pdf");
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "ملف نموذج عقد العمل pam_contract_form_2.pdf غير موجود" });
    }

    const templateBytes = fs.readFileSync(templatePath);
    const fontBytes = loadPamFontBytesSync(fontChoice);
    const coords = mergePamCoordinates(DEFAULT_PAM_COORDINATES, reqCoords);
    const pdfBytes = await generatePamContractPdfBytesFromTemplate(
      templateBytes,
      data as PamContractData,
      coords,
      fontChoice,
      fontBytes
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="PAM_Contract_Form2_${encodeURIComponent(data.employeeNameAr || "Doc")}.pdf"`
    );
    res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error("Error generating PAM contract PDF:", err);
    res.status(500).json({ error: "فشل توليد عقد العمل الحكومي", details: err.message });
  }
});

// 3. Send 2FA OTP
app.post("/api/auth/send-2fa-otp", express.json(), async (req, res) => {
  try {
    const { userId, email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryMinutes = systemSettingsStore.otp_expiry_minutes || 5;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const record: UserOtpRecord = {
      id: otpIdCounter++,
      user_id: userId || 'admin',
      otp_code: otp,
      expires_at: expiresAt,
      is_used: false,
      created_at: new Date()
    };
    userOtpCodesStore.push(record);

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || systemSettingsStore.smtp_host || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || systemSettingsStore.smtp_port || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER || systemSettingsStore.smtp_user || 'elsayedhr1993@gmail.com',
          pass: process.env.SMTP_PASS || '',
        },
      });

      if (email) {
        await transporter.sendMail({
          from: `"${systemSettingsStore.company_name_ar}" <${systemSettingsStore.official_email}>`,
          to: email,
          subject: `رمز التحقق للدخول: ${otp}`,
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h2 style="color: ${tokens.color.primary};">مصادقة تسجيل الدخول</h2>
              <p>رمز التحقق الخاص بك لتسجيل الدخول إلى لوحة التحكم هو:</p>
              <div style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #111827; margin: 20px 0;">${otp}</div>
              <p style="color: #6b7280; font-size: 12px;">صلاحية هذا الرمز ${expiryMinutes} دقائق فقط. لا تشارك الرمز مع أي شخص.</p>
            </div>
          `,
        });
      }
    } catch (mailErr) {
      console.warn("SMTP delivery notice (mock fallback active):", mailErr);
    }

    res.json({ success: true, message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "فشل إرسال الرمز", error: error.message });
  }
});

// 4. Verify 2FA OTP
app.post("/api/auth/verify-2fa-otp", express.json(), (req, res) => {
  try {
    const { userId, otpCode } = req.body;
    const now = new Date();
    const record = userOtpCodesStore.find(
      r => (String(r.user_id) === String(userId) || !userId) &&
           r.otp_code === String(otpCode).trim() &&
           !r.is_used &&
           r.expires_at > now
    );

    if (!record) {
      return res.status(400).json({ success: false, message: "رمز التحقق غير صحيح أو انتهت صلاحيته" });
    }

    record.is_used = true;
    res.json({ success: true, message: "تم التحقق بنجاح وتأكيد الدخول" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "فشل التحقق من الرمز", error: error.message });
  }
});

// 5. Download Backup Dump Endpoint
app.get("/api/settings/backup/download", async (req, res) => {
  const authCheck = await requireSuperAdmin(req);
  if (!authCheck.ok) return rejectUnauthorized(res, authCheck);

  const dump = {
    settings: systemSettingsStore,
    timestamp: new Date().toISOString(),
    version: "Aysed HR",
    sql_schema: `
-- Aysed S HR 2026 System Settings Backup Dump
INSERT INTO system_settings (
  company_name_ar, company_name_en, commercial_reg_no, civil_id_org, pasi_number, currency, official_email, phone, address
) VALUES (
  '${systemSettingsStore.company_name_ar}', '${systemSettingsStore.company_name_en}', '${systemSettingsStore.commercial_reg_no}', '${systemSettingsStore.civil_id_org}', '${systemSettingsStore.pasi_number}', '${systemSettingsStore.currency}', '${systemSettingsStore.official_email}', '${systemSettingsStore.phone}', '${systemSettingsStore.address}'
);`
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="aysed_settings_backup_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(dump, null, 2));
});

async function startServer() {
  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        strictPort: false,
        hmr: { port: undefined },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  function runStartupEnvironmentAudit() {
    console.log("=================================================");
    console.log("🚀 [AYSED HR 2026] Running Environment Validation Audit");
    console.log("=================================================");
    
    // 1. Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ywukequruqkkwvqkvcia.supabase.co';
    const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY ? '✔ Configured' : '❌ Undefined';
    const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY ? '✔ Configured (Server-only)' : '❌ Undefined';
    const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const urlCleanStatus = !supabaseUrl.includes('/rest/v1') ? '✔ Clean' : '⚠ Stripped /rest/v1';
    console.log(`[Supabase] URL: ${cleanUrl} [${urlCleanStatus}]`);
    console.log(`[Supabase] Anon Key (Client): ${supabaseAnon}`);
    console.log(`[Supabase] Service Role Key (Admin): ${supabaseService}`);

    // 2. Firebase
    const fbProject = process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0326692360';
    const fbSa = hasFirebaseAdminCredentialEnv()
      ? '✔ Credentials in env'
      : '❌ Missing (FIREBASE_SERVICE_ACCOUNT or CLIENT_EMAIL/PRIVATE_KEY)';
    const adminAuthReady = Boolean(getAdminAuth());
    const adminDbReady = Boolean(getAdminFirestore());
    console.log(`[Firebase] Project: ${fbProject} | Service Account: ${fbSa}`);
    console.log(
      `[Firebase Admin] Auth: ${adminAuthReady ? '✔' : '❌'} | Firestore: ${adminDbReady ? '✔' : '❌'}`
    );

    // 3. UltraMsg & Messaging
    const ultraInst = process.env.VITE_ULTRAMSG_INSTANCE_ID || process.env.ULTRAMSG_INSTANCE_ID || 'instance188430';
    const ultraTok = (process.env.VITE_ULTRAMSG_TOKEN || process.env.ULTRAMSG_TOKEN) ? '✔ Configured' : 'ℹ Default Preset';
    console.log(`[UltraMsg] Instance ID: ${ultraInst} | Token: ${ultraTok}`);

    // 4. SMTP
    const smtpUsr = process.env.SMTP_USER || 'Not set';
    const smtpPass = process.env.SMTP_PASS ? '✔ Configured' : 'ℹ Optional';
    console.log(`[SMTP] User: ${smtpUsr} | Pass: ${smtpPass}`);
    console.log("=================================================");
  }

  const port = await findAvailablePort(PREFERRED_PORT);
  if (port !== PREFERRED_PORT) {
    console.warn(`[Server] Port ${PREFERRED_PORT} is busy; using http://0.0.0.0:${port} instead.`);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Aysed HR running on http://0.0.0.0:${port}`);
    runStartupEnvironmentAudit();
  });
}

startServer();
