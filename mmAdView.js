enyo.kind({
    name: "MillenialMedia.AdView",
    kind: "Control",
    published: {
        /* Documented metadata as I write this is:
         * age, gender, zip, marital, income, lat, long
         */
        metadata: "",
        apid: "",
        adserver: "ads.mp.mydas.mobi",  /* Millenial Media server address */
        autoResize: true,
    },
    auid: undefined, /* User's device ID */
    ua: undefined, /* UserAgent will be copied here */
    uip: undefined, /* User's IP Address will be stored here */
    components:
    [
       { name: "webView", kind: "Control", fit: true, allowHtml: true, },
    ],
    create: function()
    {
        this.inherited(arguments);
        this.getIP();
        this.ua = navigator.userAgent;
    },
    getIP: function() {
        var request = new enyo.Ajax({
            url: "http://jsonip.com",
            handleAs: "json"
        });

        request.response(enyo.bind(this, this.receivedIP));
        request.go();
    },
    getAd: function(inUrl) {
        var u, request;
        if(inUrl){
            u = inUrl;
        } else {
            u = this.adserver;
        }
        request = new enyo.Ajax({
         url: u ,
            handleAs: "text"
        });

        request.response(enyo.bind(this, this.receivedAd));
        request.go();
    },
    failedIP: function(x, y, z) { this.log(x, ",", y, ",", z); },
    failedAd: function(x, y, z) { this.log(x, ",", y, ",", z); },
    receivedIP: function(inSender, inResponse, inRequest)
    {
        this.uip = inResponse.ip;
        // It appears that they do some kind of User-Agent filtering for desktop browsers.
        // We want to be able to test, or even run the code in desktop browsers, SO
        // we'll supply a TouchPad UA, since that is known to work, if our fetchDeviceInfo
        // call fails.
        if(window.PhoneGap || window.Cordova) {
            this.auid = device.uuid;
        } else {
            this.auid = "DEVUID";
            this.ua = "Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.5; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSSystem/234.83 Safari/534.6 TouchPad/1.0"
        }
        this.loadAd();
    },
    loadAd: function()
    {
        var params;
        var str = "?";
        if(!this.uip)
        {
            this.getIP();
            return;
        }
        params = {
            "apid": this.apid,
            "auid": this.auid,
            "ua": this.ua,
            "uip": this.uip,
        };
        enyo.mixin(params, this.metadata);
        for(var x in params) {
            str += x + "=" + encodeURI(params[x]);
            str += "&";
        }
        this.getAd("http://" + this.adserver + "/getAd"+str);
    },
    receivedAd: function(inSender, inResponse, inRequest)
    {
        inResponse = decodeURI(inResponse);
        this.log("Received Ad:", inResponse);
        if(inResponse.length > 0 && this.$.webView.content != inResponse)
        {
            if(this.autoResize)
            {
                var reg = /.*width="(\d+)" height="(\d+)"/ig;
                var match = reg.exec(inResponse);
                if(match) {
                    this.log("width=", match[1], "height=", match[2] );
                    this.applyStyle("width", match[1]+"px");
                    this.applyStyle("height", match[2]+"px");
                }            
            }
            this.$.webView.setContent(inResponse);
        }
    }
});