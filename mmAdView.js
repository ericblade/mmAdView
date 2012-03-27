enyo.kind({
    name: "MillenialMedia.AdView",
    kind: "VFlexBox",
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
        { name: "getIP", kind: "WebService", url: "http://jsonip.com", handleAs: "json", onSuccess: "receivedIP", onFailure: "failedIP" },
        { name: "getAd", kind: "WebService", url: this.adserver, handleAs: "text", onSuccess: "receivedAd", onFailure: "failedAd", },
        { name: "webView", kind: "Control", flex: 1, allowHtml: true, },
    ],
    create: function()
    {
        this.inherited(arguments);
        this.$.getIP.call();
        this.ua = navigator.userAgent;
    },
    failedIP: function(x, y, z) { this.log(x, ",", y, ",", z); },
    failedAd: function(x, y, z) { this.log(x, ",", y, ",", z); },
    receivedIP: function(inSender, inResponse, inRequest)
    {
        var deviceInfo = enyo.fetchDeviceInfo();
        this.uip = inResponse.ip;
        this.auid = deviceInfo ? deviceInfo.serialNumber : inResponse.ip; /* If not running on a device, then use IP address for uid */
        this.loadAd();
    },
    loadAd: function()
    {
        var params;
        var str = "?";
        if(!this.uip)
        {
            this.$.getIP.call();
            return;
        }
        params = {
            "apid": this.apid,
            "auid": this.auid,
            "ua": this.ua,
            "uip": this.uip,
        };
        enyo.mixin(params, this.metadata);
        this.$.getAd.setUrl("http://" + this.adserver + "/getAd");
        for(var x in params) {
            str += x + "=" + encodeURI(params[x]);
            str += "&";
        }
        this.log(this.$.getAd.url + str);
        this.$.getAd.call(params);
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