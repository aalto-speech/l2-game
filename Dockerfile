FROM tiangolo/uwsgi-nginx-flask:python3.6-alpine3.7

RUN apk --update add bash nano gcc musl-dev libffi-dev openssl-dev python3-dev

ENV STATIC_URL /static

#ENV STATIC_PATH /var/www/app/static
ENV STATIC_PATH /app/app/static

COPY app/requirements.txt /var/www/requirements.txt
#COPY app/requirements.txt app/requirements.txt

RUN pip install -r /var/www/requirements.txt
#RUN pip install -r /app/requirements.txt


