import 'dotenv/config';
import { getAdminFirestore } from '../server/firebaseAdmin.ts';

const ELITE_ID = 'comp-1788435917695';

async function main() {
  const db = getAdminFirestore();
  const comp = (await db.collection('companies').doc(ELITE_ID).get()).data();
  const users = await db.collection('users').where('companyId', '==', ELITE_ID).get();
  console.log(
    JSON.stringify(
      {
        company: comp
          ? {
              adminUsername: comp.adminUsername,
              email: comp.email,
              isActive: comp.isActive,
              status: comp.status,
            }
          : null,
        users: users.docs.map((d) => ({
          uid: d.id,
          email: d.data().email,
          role: d.data().role,
          status: d.data().status,
          suspended: d.data().suspended,
        })),
      },
      null,
      2
    )
  );
}

main().catch(console.error);
