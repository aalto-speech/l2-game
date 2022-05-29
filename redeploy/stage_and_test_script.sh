#!/bin/bash


echo "Pulling new version at `date`" > last_deploy.txt
git pull
touch uwsgi.ini

echo "Wait 10 sec"

for i in {1..10}; do
    echo -n "$i "
    sleep 1s
done

#. ../envVars.local.txt
while read -r line; do declare "$line"; done < envVars.local.txt

env TESTHOST=STAGING pytest-3 --verbose redeploy/ > stage_result.txt
if [ "$?" == 0 ]; then
    pass="passed"
else
    pass="failed"
fi

echo -e "To: $DEVELOPERS" > test_report.txt
echo -e "From: TEFLON user backend accounts <accounts@FIX_DOMAIN.FOO>" >> test_report.txt
echo -e "Subject: TEFLON user backend staging report: $pass\n" >> test_report.txt

git log -1 >> test_report.txt
echo -e "\n" >> test_report.txt
cat stage_result.txt >> test_report.txt

report=""

if [ "$pass" == "passed" ]; then
    report="$report\n\n\nAll tests passed."
    report="$report\nDeploying to production now via a call to production server."
    reply_code=`curl -s -o /dev/null -w "%{http_code}" $PRODUCTION_DEPLOYMENT_WEBHOOK`
    report="$report\n\n$PRODUCTION_DEPLOYMENT_WEBHOOK replied $reply_code"

    echo "Wait 20 sec before testing production"
    
    for i in {1..20}; do
	echo -n "$i "
	sleep 1s
    done
    
    env TESTHOST=PRODUCTION pytest-3 --verbose redeploy/ > test_result.txt
    if [ "$?" == 0 ]; then
	testpass="passed"
    else
	testpass="failed"
    fi
    if [ "$testpass" == "passed" ]; then
	report="$report\n\n\nAll tests passed on production server."
    else
	report="$report\n\n\nSome tests failed!"
	report="$report\nLook into prodcuction server logs."
    fi
else
    report="$report\n\n\nSome tests failed!"
    report="$report\nLog output below (newest first)"
    report="$report\n`docker logs -t --tail 300 cms_flask  2>&1 | tac`"
fi

echo -e "$report" >> test_report.txt

ssmtp $DEVELOPERS < test_report.txt


