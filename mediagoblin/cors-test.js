"use strict";
var MediaGoblin = function (endpoint) {
    return MediaGoblin.init(endpoint);
};
if (! ('sendAsBinary' in new XMLHttpRequest())) {
    console.log('Using sendAsBinary polyfill');
    XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
        function byteValue(x) {
            return x.charCodeAt(0) & 0xff;
        }
        var ords = Array.prototype.map.call(datastr, byteValue);
        var ui8a = new Uint8Array(ords);
        this.send(ui8a.buffer);
    }
}

(function (mg) {
    mg.init = function (endpoint) {
        this.endpoint = endpoint;
        console.log('Initialized MediaGoblin client, using '
            + endpoint + ' as endpoint.');

        return this;
    };
    mg.get = function (url, cb) {
        var client = new XMLHttpRequest();

        client.addEventListener('readystatechange', function () {
            if (this.readyState == this.DONE) {
                if (this.status == '200') {
                    cb(JSON.parse(this.responseText));
                }
            }
        });

        client.open('GET', this.endpoint + url, true);
        client.setRequestHeader('Accept', 'application/json');
        client.send()
    };
    mg.post = function (url, params, cb) {
        var client = new XMLHttpRequest();

        client.addEventListener('readystatechange', function () {
            if (this.readyState == this.DONE) {
                if (this.status == 200) {
                    cb(JSON.parse(this.responseText));
                }
            }
        });

        var boundary = 'MediaGoblinJavaScriptClient'
            + new String(Math.round(Math.random() * 1000, 0));

        client.open('POST', this.endpoint + url, true);
        var body = '';

        if (params.files && params.files.length) {
            client.setRequestHeader('Content-Type',
                    'multipart/form-data; boundary=----' + boundary);

            for (var i in params.files) {
                var file = params.files[i];
                body += "------" + boundary + "\r\n";

                body += 'Content-Disposition: form-data; name="'
                    + file.name + '"; filename="'
                    + file.filename + '"\r\n';
                body += 'Content-Type: ' + file.type + '\r\n\r\n';
                body += file.data + "\r\n";
                body += "------" + boundary + "--";
            }
            client.sendAsBinary(body);
        } else {
            client.send(body);
        }
    };
})(MediaGoblin);

var mg = MediaGoblin('https://joar.pagekite.me');

document.getElementById('status').textContent = 'Loading...';

var fileField = document.getElementById('file');

function onFileChange(e) {
    readFileData(fileField);
}

function readFileData(fileField) {
    var file = fileField.files[0];
    var fr = new FileReader();
    fr.onloadend = function (e) {
        console.log(this.result.length);
        uploadFile(fileField.name, this.result, file.type, file.name);
        console.log('Done');
    };
    console.log('Reading data from ' + file.name);
    fr.readAsBinaryString(file);
}
function uploadFile(name, data, type, filename) {
    console.log('Uploading file...');
    mg.post('/api/submit?access_token='
            + document.getElementById('access_token').value, {
        files: [
        {
            name: name,
            data: data,
            type: type,
            filename: filename
        }]},
        function (response) {
            console.log(response);
        });
}

fileField.addEventListener('change', onFileChange);

mg.get('/api/entries', function (data) {
    document.body.removeChild(document.getElementById('status'));
    console.log('Response:', data);
    for (var i in data) {
        var entry = data[i];
        var em = document.createElement('li');

        var action_em = document.createElement('p');
        var user_link = document.createElement('a');


        user_link.textContent = entry.user;
        user_link.href = entry.user_permalink;

        var action_desc = document.createElement('span');

        action_desc.textContent = ' posted ';

        var entry_title = document.createElement('a');
        entry_title.href = entry.permalink;
        entry_title.textContent = entry.title;

        var thumbnail_link = document.createElement('a');
        thumbnail_link.href = entry.permalink;

        var thumbnail = document.createElement('img');
        thumbnail.src = entry.media_files.thumb;

        thumbnail_link.appendChild(thumbnail);

        var time = document.createElement('p');
        time.textContent = new Date(entry.created.replace(/\.[0-9]+$/, 'Z'));

        action_em.appendChild(user_link);
        action_em.appendChild(action_desc);
        action_em.appendChild(entry_title);

        em.appendChild(action_em);
        em.appendChild(thumbnail_link);
        em.appendChild(time);

        document.getElementById('images').appendChild(em);
    }
});
