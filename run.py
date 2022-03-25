from api import create_app, db

app = create_app()

@app.cli.command()
def createdb():
  db.create_all()

if __name__ == '__main__':
  app.run(host='0.0.0.0', port=3000, debug=True)
  
#-----------------------------------------------
# FLASK_APP=run.py flask createdb