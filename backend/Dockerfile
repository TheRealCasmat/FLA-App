FROM python:3.12-slim

WORKDIR /backend

COPY . /backend

RUN pip install --no-cache-dir flask flask-sqlalchemy psycopg2-binary python-dotenv flask-cors torch

EXPOSE 5000

ENV FLASK_APP=app.py
ENV FLASK_ENV=development

CMD ["flask", "run", "--host=0.0.0.0", "--debug"]
