# TEFLON user admin backend for schools


1. Fix the few hardcoded urls in js and sh files (Please make them configurable while you're there!)

2. Copy and fill the env parameter file

3. Build and start with `docker-compose up -d`.

4. If you need to rebuild, do `docker-compose up -d --no-deps --build`.

This is research code intended for academic research use.

This is based on old code from previous projects. Any information related to the services (urls, access tokens etc) have been removed. If any persist, please alert Aalto so these can be removed from repository history.

Let's repeat the warning: THIS IS RESEARCH CODE; DON'T EXPECT TOO MUCH!

The developers no longer work at Aalto University so there is little hope of getting guidance to modifying it.

Few tips for a smoother ride:

(1) scripts in redeploy directory are meant to be called by a web hook triggered by a repository change on a staging server. Staging server runs automatic tests, sends an email report and if successful triggers a deployment hook at the proper server.

(2) A mailtrain mailing list service was set to contact participants in tests. Users were added to the mailing list through the API. Probably these functions need to be disabled if you don't have this available.