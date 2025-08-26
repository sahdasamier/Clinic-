import{ManualSyncUtility as r}from"./manualSync-CKHOLdrN.js";import"./index-H82Uz7G-.js";import"./vendor-mui-DfoGQe7b.js";import"./vendor-react-DBJs7CER.js";import"./vendor-i18n-fNoC129p.js";import"./vendor-firebase-Bz7DBBYX.js";import"./vendor-charts-CXjeBip2.js";const o=async()=>{console.log("🆘 EMERGENCY FIX: Starting immediate sync...");try{const e=await r.syncAppointmentsToPatients("demo-clinic");return"error"in e?(console.error("❌ Emergency fix failed:",e.error),typeof window<"u"&&alert(`❌ Emergency fix failed: ${e.error}`),!1):(console.log("🎉 Emergency fix completed:",e),typeof window<"u"&&alert(`🎉 EMERGENCY FIX COMPLETED!

✅ Created ${e.patientsCreated} patients
✅ Linked ${e.patientsLinked} existing patients
✅ Processed ${e.appointmentsProcessed}/${e.totalAppointments} appointments

Refresh the patient page to see your patients!`),!0)}catch(e){return console.error("❌ Emergency fix error:",e),typeof window<"u"&&alert(`❌ Emergency fix error: ${e}`),!1}},t=async()=>{console.log("⚡ QUICK FIX: Creating patients from appointments...");try{const e=await r.quickCreatePatientsFromAppointments("demo-clinic");return console.log("⚡ Quick fix completed:",e),typeof window<"u"&&alert(`⚡ QUICK FIX COMPLETED!

✅ Created ${e.created} patients from appointments

Refresh the patient page to see your patients!`),!0}catch(e){return console.error("❌ Quick fix error:",e),typeof window<"u"&&alert(`❌ Quick fix error: ${e}`),!1}};window.EMERGENCY_FIX=o;window.QUICK_FIX=t;window.emergencyFix=o;window.quickFix=t;window.fixNow=o;console.log("🆘 Emergency Fix Commands Available:");console.log("   EMERGENCY_FIX() - Full sync with detailed results");console.log("   QUICK_FIX() - Quick patient creation");console.log("   emergencyFix() - Shortcut for full sync");console.log("   quickFix() - Shortcut for quick fix");console.log("   fixNow() - Another shortcut for full sync");const p={EMERGENCY_FIX:o,QUICK_FIX:t};export{o as EMERGENCY_FIX,t as QUICK_FIX,p as default};
