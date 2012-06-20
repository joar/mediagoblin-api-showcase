var MediaGoblin = function (endpoint) {
    return MediaGoblin.init(endpoint);
};

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
})(MediaGoblin);

$(document).ready(function () {
    mg = MediaGoblin('http://joar.pagekite.me');

    $('#status').text('Loading...');

    mg.get('/', function (data) {
        $('#status').remove();
        console.log('Response:', data);
        for (i in data) {
            $('#images').append('<li>'
                    + '<img src="'
                    + mg.endpoint + data[i].media_files.thumb
                    + '" />'
                    + '<br />'
                    + '<p>'
                    + data[i].title
                    + '</p>'
                    + '</li>');
        }
    });
});
/*
$(window).load(function(){
$(document).ready(function () {
    url = 'http://joar.pagekite.me/submit/';
    $(document).delegate('#fileinput', 'change', function () {
        console.log($(this));
        var file = $(this)[0].files[0],
            client = new XMLHttpRequest();
        
        
        client.upload.addEventListener('progress', function (ev) {
            if (ev.lengthComputable) {
                $('#result').text('uploaded ' + ev.loaded + ' of total ' + ev.total);
            }
        }, false);
        
        client.upload.addEventListener('error', function (ev) {
            console.log(ev);
        }, false);
        
        client.onreadystatechange = function(){            
            if (this.readyState == this.DONE){
                console.log(this);
            }
        };
        
        client.open('POST', url, true);
        
        client.setRequestHeader('Accept', 'application/json');
        client.setRequestHeader("Content-Type", "application/octet-stream");
        client.send(file);
        
    });
});
});
*/
