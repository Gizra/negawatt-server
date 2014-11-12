function setServerName(card) {
    var host = $("#new-server-fqdn").val();
    var name = $("#new-server-name").val();
    var displayName = host;

    if (name) {
        displayName = name + " ("+host+")";
    };

    card.wizard.setSubtitle(displayName);
    card.wizard.el.find(".create-server-name").text(displayName);
}

function validateIP(ipaddr) {
    //Remember, this function will validate only Class C IP.
    //change to other IP Classes as you need
    ipaddr = ipaddr.replace(/\s/g, "") //remove spaces for checking
    var re = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/; //regex. check for digits and in
    //all 4 quadrants of the IP
    if (re.test(ipaddr)) {
        //split into units with dots "."
        var parts = ipaddr.split(".");
        //if the first unit/quadrant of the IP is zero
        if (parseInt(parseFloat(parts[0])) == 0) {
            return false;
        }
        //if the fourth unit/quadrant of the IP is zero
        if (parseInt(parseFloat(parts[3])) == 0) {
            return false;
        }
        //if any part is greater than 255
        for (var i=0; i<parts.length; i++) {
            if (parseInt(parseFloat(parts[i])) > 255){
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}

function validateFQDN(val) {
    return /^[a-z0-9-_]+(\.[a-z0-9-_]+)*\.([a-z]{2,4})$/.test(val);
}

function fqdn_or_ip(el) {
    var val = el.val();
    ret = {
        status: true
    };
    if (!validateFQDN(val)) {
        if (!validateIP(val)) {
            ret.status = false;
            ret.msg = "Invalid IP address or FQDN";
        }
    }
    return ret;
}


$(function() {
    $.fn.wizard.logging = true;



    if ($("#wizard-demo").length > 0) {

        var wizard = $("#wizard-demo").wizard();

        wizard.el.find(".wizard-ns-select").change(function() {
            wizard.el.find(".wizard-ns-detail").show();
        });

        wizard.el.find(".create-server-service-list").change(function() {
            var noOption = $(this).find("option:selected").length == 0;
            wizard.getCard(this).toggleAlert(null, noOption);
        });

        wizard.cards["name"].on("validated", function(card) {
            var hostname = card.el.find("#new-server-fqdn").val();
        });

        wizard.on("submit", function(wizard) {
            var submit = {
                "hostname": $("#new-server-fqdn").val()
            };

            setTimeout(function() {
                wizard.trigger("success");
                wizard.hideButtons();
                wizard._submitting = false;
                wizard.showSubmitCard("success");
                wizard._updateProgressBar(0);
            }, 2000);
        });

        wizard.on("reset", function(wizard) {
            wizard.setSubtitle("");
            wizard.el.find("#new-server-fqdn").val("");
            wizard.el.find("#new-server-name").val("");
        });

        wizard.el.find(".wizard-success .im-done").click(function() {
            wizard.reset().close();
        });

        wizard.el.find(".wizard-success .create-another-server").click(function() {
            wizard.reset();
        });

        $(".wizard-group-list").click(function() {
            alert("Disabled for demo.");
        });

        $("#open-wizard").click(function() {
            wizard.show();
        });

        wizard.show();
    }


});
