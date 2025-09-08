#to run the repo and deploy 
--run dev
--yarn build 
--firebase deploy --only hosting:prod
--firebase deploy --only hosting:dev
--firebase deploy --only firestore,storage --project produ