import os
from os.path import join
from flask import Flask, send_from_directory, make_response, jsonify, request
from bandwidths import BANDWIDTHS
import datetime
import math
api_path='/api/'
app = Flask(__name__)
app.config['SECRET_KEY'] = 'development key'
pathCur = os.path.abspath(os.pardir)
pathFolder = join(pathCur,"client", "build")


devices = list(set([band['device_id'] for band in BANDWIDTHS]))



# @app.route('/<path:path>')
# def serve(path):
#
#     path = path.replace(api_path.split("/")[0]+"/", "")
#     if path != "" and os.path.exists(join(pathFolder, path)):
#         return send_from_directory(pathFolder, path)
#     else:
#         return send_from_directory(pathFolder, 'index.html')


def get_windows(device_id=None, endtime=datetime.datetime.now().timestamp(), window=10,seonds_per_w=None, page=1):

    widths = [ i for i in BANDWIDTHS if i['device_id'] == device_id]
    times = [w["timestamp"] for w in widths]

    end_time_found = max(times)
    min_time_found = min(times)
    end_time_used = end_time_found if end_time_found < endtime else endtime
    time_end_interval = math.ceil(end_time_used / seonds_per_w) * seonds_per_w
    time_begin_interval = math.floor(min_time_found / seonds_per_w) * seonds_per_w

    frames = [i for i in
                        range(
                                time_begin_interval,
                                time_end_interval+seonds_per_w, seonds_per_w
                                )]

    frames_needed = frames[-(window*(page)):][:window]
    num_pages = (len(frames) // window) + 1

    data_returned = {
                        'frames': {
                    frame :
                        {
                            'bytes_ts_total': 0,
                            'bytes_fs_total': 0,
                            'total': 0
                        } for frame in frames_needed
                        },
                            'page': page,
                            'limit' : window,
                            'next_page' : -1 if num_pages <= page else page +1,
                            'num_pages' : num_pages
                    }

    for w in widths:

        frame = [f for f in frames_needed if w["timestamp"] >= f]
        if frame:
            frame = max(frame)
            data_returned['frames'][frame]['bytes_ts_total'] += w['bytes_ts']
            data_returned['frames'][frame]['bytes_fs_total'] += w['bytes_fs']
            data_returned['frames'][frame]['total'] = data_returned['frames'][frame]['bytes_ts_total'] +  data_returned['frames'][frame]['bytes_fs_total']

        else:
            continue
    return data_returned
@app.route("{api_path}device".format(api_path=api_path))
def device():
    res = {'data': None, "error": True}
    id = request.args["device_uuid"]
    windows = int(request.args["num_windows"]) if 'num_windows' in request.args.keys() else 10
    page = int(request.args["page"])  if 'page' in request.args.keys() else 1
    window_seconds = int(request.args["window_time"])  if 'window_time' in request.args.keys() else 60
    end_time =  int(request.args["end_time"])  if 'end_time' in request.args.keys() else datetime.datetime.now().timestamp()



    try:
        res_data = get_windows(
                                device_id=id,
                                endtime=end_time,
                                window=windows,
                                seonds_per_w=window_seconds,
                                page=page
                                )
        res['data'] = res_data
        res['error'] = False
    except Exception as e:
        print(e)
    finally:
        res = make_response(jsonify(res))
        res.headers['Access-Control-Allow-Origin'] = "*"
        res.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'

    return res

@app.route("{api_path}all_devices".format(api_path=api_path))
def all_devices():
    res = {'devices': devices}

    res = make_response(jsonify(res))
    res.headers['Access-Control-Allow-Origin'] = "*"
    res.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept'
    return res


if __name__ == '__main__':
    app.run(host='127.0.0.1', port='5000', reload=True)
