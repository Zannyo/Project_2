import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

#################################################
# Database Setup
#################################################
engine = create_engine("postgres://iwmrxujo:3y_paPbLw9au1C16kHoCOJgz5aY-F63r@ruby.db.elephantsql.com:5432/iwmrxujo")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
print(list(Base.classes))
Songs = Base.classes["Top200Worldwide"]

#################################################
# Flask Setup
#################################################
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

#################################################
# Flask Routes
#################################################

@app.route("/artist")
@cross_origin()
def top_artist():
    conn = engine.connect()
    sql = """
    select * FROM (
	select
		country, artist, total_streams,
		RANK() OVER (PARTITION BY country ORDER BY total_streams DESC) AS country_rank
		FROM (
			select
				t."Country" AS country, t."Artist" as artist, SUM(t."Streams") AS total_streams
				from
					"Top200Worldwide" AS t
			GROUP BY t."Country", t."Artist"
		) AS query
	) AS ranks
    WHERE country_rank = 1
    """
    results = conn.execute(sql)

    for artist in results:
        print(f"{artist['artist']} had {artist['total_streams']} streams in {artist['country']}")
    return "yay"

@app.route("/spotify")
@cross_origin()
def spotify():
    session = Session(engine)
    results = session.query(Songs).all()
    songs = []

    for song in results:
        new_song = {}
        new_song["country"] = song.Country
        new_song["track_name"] = song.TrackName
        new_song["artist"] = song.Artist
        new_song["streams"] = song.Streams
        new_song["url"] = song.URL
        new_song["position"] = song.Position
        new_song["id"] = song.pk
        songs.append(new_song)

    session.close()
    return jsonify(songs)

# @app.route("/globe")
# def globe():
#     session = Session(engine)
#     results = session.query(Globe).all()
#     globe = []

#     pd.read_sql_query('select streams from artist', con=engine).head()



# streams from
# table
# group by artist_name
# order by streams desc
# limit 1



# @app.route("/api/v1.0/names")
# def names():
#     # Create our session (link) from Python to the DB
#     session = Session(engine)

    """Return a list of all passenger names"""
    # Query all passengers
    results = session.query(Songs.name).all()

    session.close()

#     # Convert list of tuples into normal list
#     all_names = list(np.ravel(results))

#     return jsonify(all_names)


# @app.route("/api/v1.0/passengers")
# def passengers():
#     # Create our session (link) from Python to the DB
#     session = Session(engine)

#     """Return a list of passenger data including the name, age, and sex of each passenger"""
#     # Query all passengers
#     results = session.query(Passenger.name, Passenger.age, Passenger.sex).all()

#     session.close()

#     # Create a dictionary from the row data and append to a list of all_passengers
#     all_passengers = []
#     for name, age, sex in results:
#         passenger_dict = {}
#         passenger_dict["name"] = name
#         passenger_dict["age"] = age
#         passenger_dict["sex"] = sex
#         all_passengers.append(passenger_dict)

#     return jsonify(all_passengers)


if __name__ == '__main__':
    app.run(debug=True)