import{c as s}from"./index-Q6DvNLOt.js";import{quickFixDoctorIssues as i}from"./quickDoctorFix-CRAKudHO.js";import"./vendor-mui-DfoGQe7b.js";import"./vendor-react-DBJs7CER.js";import"./vendor-i18n-fNoC129p.js";import"./vendor-firebase-Bz7DBBYX.js";import"./vendor-charts-CXjeBip2.js";const t=async(n="demo-clinic")=>{console.log("🚀 INSTANT DOCTOR FIX - Starting the fastest comprehensive solution..."),console.log("================================================================");try{console.log("⚡ STEP 1: Fixing placeholder values and invalid IDs...");const o=await i();console.log(o?"✅ Quick fixes applied successfully":"⚠️ Quick fix completed with warnings"),console.log("🔧 STEP 2: Running comprehensive doctor assignment fix...");const e=await s(n);return console.log("🔄 STEP 3: Refreshing application data..."),window.dispatchEvent(new CustomEvent("doctorAssignmentChanged")),window.dispatchEvent(new CustomEvent("firebaseDataUpdate")),console.log(""),console.log("🎉 INSTANT FIX RESULTS:"),console.log("======================="),console.log(`✅ Comprehensive fix: ${e.success?"Success":"Failed"}`),console.log(`📊 Appointments fixed: ${e.appointmentsFixed}`),console.log(`👥 Patients fixed: ${e.patientsFixed}`),e.success?(console.log(""),console.log("🎊 ALL DOCTOR ISSUES FIXED INSTANTLY!"),console.log("Please refresh your application to see the changes."),typeof window<"u"&&window.alert&&alert(`🎉 INSTANT FIX COMPLETE!

✅ Fixed ${e.appointmentsFixed} appointments
✅ Fixed ${e.patientsFixed} patients

Please refresh your browser to see all changes!`),!0):(console.log("⚠️ Some issues may remain:",e.message),typeof window<"u"&&window.alert&&alert(`⚡ INSTANT FIX PARTIAL SUCCESS

✅ Fixed ${e.appointmentsFixed} appointments
✅ Fixed ${e.patientsFixed} patients

⚠️ Some issues remain: ${e.message}

Please refresh your browser and check the console for details.`),!1)}catch(o){return console.error("❌ Instant fix failed:",o),typeof window<"u"&&window.alert&&alert(`❌ INSTANT FIX FAILED

Error: ${o instanceof Error?o.message:String(o)}

Try running individual fix functions:
• completeDoctorAssignmentSolution()
• quickFixDoctorIssues()
• debugPatientDoctorAssignment()`),!1}};typeof window<"u"&&(window.runInstantDoctorFix=t);export{t as default,t as runInstantDoctorFix};
