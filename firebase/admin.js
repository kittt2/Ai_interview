// import { getApps } from 'firebase-admin/app';
// import { getAnalytics } from 'firebase/analytics';
// import { initializeApp } from 'firebase/app';
// import {getAuth} from 'firebase/auth';
// import {getFirestore} from 'firebase/firestore';

// const initFirebseAdmin = ()=>{

//     const app = getApps();
//     if(!app.length){
//         initializeApp({
//             credential : cert({
//                 projectId:process.env.Fproject_id,
//                 clientEmail:process.env.Fclient_email,
//                 privateKey:process.env.Fprivate_key?.replace(/\\n/g,"\n"),
  
  
  
//             })
//         })
//     }

//     return {
//         auth:getAuth(),
//         db: getFirestore()
//     }

// }

// export const {auth, db} = initFirebseAdmin();
