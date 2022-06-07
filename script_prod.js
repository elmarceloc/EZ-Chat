
var someStyle = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter&display=swap');

html, body{
    background: #131315!important;
}
.inner{
    background: #131315!important;
}

.Dashboard.dark .chatContainer {
    background: #131315!important;
}

.title{
    background: #131315!important;

}

.newSub{
    color: white!important;
    background: #9548FF!important;
}

.paneTitle{
    display:none!important;
}

.title{
    border: none!important;
    margin: 0px!important;
    padding: 0!important;
}
.youtube{
    display: block!important;
}
.Message{
    padding-left: 12px!important;
    padding-right: 12px!important;
    font-family: 'Inter', sans-serif!important;
}
.Message:hover{
    background: #464649!important;
}
.Message a{
    color: #bf94ff!important;
}
.message{
    color: rgb(239,239,241)!important;
}
button{
    font-size: 12px!important;
    border: none!important;
    border-radius: 2px!important;
}
.good{
    border-top: 11px solid rgb(44, 44, 44)!important;
}
.Dashboard.paused * {
    color: none!important;
    filter: none!important
}
.connectLoading{
    background-color: #131315!important;
    background-image: none!important
}
.name:hover{
    text-decoration: underline!important;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', someStyle);

// Get URL Parameters (Credit to html-online.com)
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}
function getUrlParam(parameter, defaultvalue) {
    var urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}
const url = new URL(window.location.href);

let channel = url.pathname.replace('/','')
let emotes = [];
let twitchID;
var badges = []
var mods = []

async function getEmotes() {
    function returnResponse(response) {
        return response.json();
    }
    function logError(error) {
        console.log(error.message);
    }

    // const proxyurl = 'https://cors-anywhere.herokuapp.com/';
    const proxyurl = "https://tpbcors.herokuapp.com/";
    let totalErrors = [];
   
    // get channel twitch ID
    let res = await fetch(proxyurl + "https://api.ivr.fi/twitch/resolve/" + channel, {
        method: "GET",
        headers: { "User-Agent": "api.roaringiron.com/emoteoverlay" },
    }).then(returnResponse, logError);
    if (!res.error || res.status == 200) {
        twitchID = res.id;
    } else {
        totalErrors.push("Error getting twitch ID");
    }

    // get all BTTV emotes
    res = await fetch(proxyurl + "https://api.betterttv.net/3/cached/users/twitch/" + twitchID, {
        method: "GET",
    }).then(returnResponse, logError);
    if (!res.message) {
        for (var i = 0; i < res.channelEmotes.length; i++) {
            let emote = {
                emoteName: res.channelEmotes[i].code,
                emoteURL: `https://cdn.betterttv.net/emote/${res.channelEmotes[i].id}/2x`,
            };
            emotes.push(emote);
        }
        for (var i = 0; i < res.sharedEmotes.length; i++) {
            let emote = {
                emoteName: res.sharedEmotes[i].code,
                emoteURL: `https://cdn.betterttv.net/emote/${res.sharedEmotes[i].id}/2x`,
            };

            if (emote.emoteName != 'FeelsStrongMan') {
                emotes.push(emote);
            }
        }
        console.log(emotes);
    } else {
        totalErrors.push("Error getting bttv emotes");
    }
    // global bttv emotes
    res = await fetch("https://api.betterttv.net/3/cached/emotes/global", {
        method: "GET",
    }).then(returnResponse, logError);
    if (!res.message) {
        for (var i = 0; i < res.length; i++) {
            let emote = {
                emoteName: res[i].code,
                emoteURL: `https://cdn.betterttv.net/emote/${res[i].id}/2x`,
            };
            emotes.push(emote);
        }
        console.log(emotes);
    } else {
        totalErrors.push("Error getting global bttv emotes");
    }

    // get all 7TV emotes
        res = await fetch( `https://api.7tv.app/v2/users/${channel}/emotes`, {
            method: "GET",
        }).then(returnResponse, logError);
        if (!res.error || res.status == 200) {
            if (res.Status === 404) {
                totalErrors.push("Error getting 7tv emotes");
            } else {
                for (var i = 0; i < res.length; i++) {
                    let emote = {
                        emoteName: res[i].name,
                        emoteURL: res[i].urls[1][1],
                    };
                    emotes.push(emote);
                }
            }
        } else {
            totalErrors.push("Error getting 7tv emotes");
        }
        // get all 7TV global emotes
        res = await fetch(`https://api.7tv.app/v2/emotes/global`, {
            method: "GET",
        }).then(returnResponse, logError);
        if (!res.error || res.status == 200) {
            if (res.Status === 404) {
                totalErrors.push("Error getting 7tv global emotes");
            } else {
                for (var i = 0; i < res.length; i++) {
                    let emote = {
                        emoteName: res[i].name,
                        emoteURL: res[i].urls[1][1],
                    };
                    
                    
                    if (emote.emoteName != "AYAYA" && emote.emoteName != "peepoHappy") {
                        emotes.push(emote);
                    }
                }
            }
        } else {
            totalErrors.push("Error getting 7tv global emotes");
        }


                   
        fetch('https://badges.twitch.tv/v1/badges/global/display').then(function(response) {
            return response.json();
        }).then(function(response) {
            Object.entries(response.badge_sets).forEach(badge => {
                Object.entries(badge[1].versions).forEach(v => {
                    badges[badge[0] + ':' + v[0]] = v[1].image_url_4x;
                });
            }
            );
            fetch('https://badges.twitch.tv/v1/badges/channels/' + encodeURIComponent(twitchID) + '/display').then(function(response) {
                return response.json();
            }).then(function(channel) {
                Object.entries(channel.badge_sets).forEach(badge => {

                    Object.entries(badge[1].versions).forEach((v,index) => {
                        badges[badge[0] + '-' + (index+1)] = v[1].image_url_4x;
                    });
                });

                console.log(badges)
                
            });

            fetch(`https://api.ivr.fi/twitch/modsvips/${channel}`).then(function(response) {
                return response.json();
            }).then(function(channel) {

            // get only the login property of the mods
            mods = channel.mods.map(mod => mod.login);
                
            });
        })
        

    if (totalErrors.length > 0) {
        totalErrors.forEach((error) => {
            console.error(error);
        });
    }
}
function escapeRegex(string) {
	return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}



var chit = document.querySelectorAll('.inner')[0];
var chat = document.querySelectorAll('.inner')[1];

//const priorityBadges = ['predictions', 'admin', 'global_mod', 'staff', 'twitchbot', 'broadcaster', 'moderator', 'vip'];

// https://github.com/GuineaGuy99/BTTVlessBTTVemotes/blob/master/BTTVlessBTTVemotes.js
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                if (mutation.addedNodes[i].classList.contains("Message")) {
                    let message = mutation.addedNodes[i];
                    const name = message.querySelector(".name").innerText;

                    message.querySelector(".name").onclick = function() {
                        window.open('https://www.twitch.tv/popout/' + channel + '/viewercard/' + name, '_blank');
                    }


                    var messageTextElement = message.querySelector(".message");
                    var newMessageHTML = messageTextElement.innerHTML;
                    
                    // remove images from newMessageHTML

                    for (const emote of emotes) {
                        var regexp = new RegExp("\\b" + escapeRegex(emote.emoteName) + "\\b", 'g'),
                        //.replace(/<img[^>]*>/g, "")
                        newMessageHTML = newMessageHTML.replace(regexp, `<img class="emoticon" src="${emote.emoteURL}"></img>`);
                    }

                    regexp = new RegExp("( |^)" + "&lt;3" + "\\b", "g");
                    newMessageHTML = newMessageHTML.replace(regexp, `<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v1/9/4.0"></img>`);
		
                    regexp = new RegExp("\\b" + "D:" + "( |$)", "g");
                    newMessageHTML = newMessageHTML.replace(regexp, `<img class="emoticon" src="https://cdn.betterttv.net/emote/55028cd2135896936880fdd7/3x"></img>`);

                    regexp = new RegExp(":tf:", "g");
                    newMessageHTML = newMessageHTML.replace(regexp, `<img class="emoticon" src="https://cdn.betterttv.net/emote/54fa8f1401e468494b85b537/3x"></img>`);

        
                    var $userInfo = document.createElement('span');
                    $userInfo.classList.add('user_info');
                    
                    var userBadges = []

                    /*fetch(`https://api.ivr.fi/twitch/subage/${name}/${channel}`).then(function(response) {
                        return response.json();
                    }).then(function(data) {
                        console.log(data)*/

                      /*  if(data.subscribed){
                            console.log(data.streak.months)
                            userBadges.push({
                                url: badges['subscriber-'+data.streak.months]
                            }) 
                        }*/


                    if(mods.includes(name.toLowerCase())){
                        console.log(name+' is mod')
                        userBadges.push({
                            url: badges['moderator:1']
                        }) 
                    }


                    if(mutation.addedNodes[i].classList.contains('subscriber')) {
                        // get amount of elements in badges object

                        if(Object.entries(badges).length > 0){
                            userBadges.push({
                                url: badges['subscriber-1']
                            }) 
                        }
                    }

                
                   /* var $modBadge;
                    badges.forEach(badge => {
                        if (badge.priority) {
                            var $badge = document.createElement('img');
                            $badge.className = 'badge';
                            $badge.src = badge.url;
                            if (badge.description === 'moderator') $modBadge = $badge;
                            $userInfo.append($badge);
                        }
                    });
                    
                    if (userBadges[name]) {
                        userBadges[name].forEach(badge => {
                            var $badge = document.createElement('img');
                            $badge.className = 'badge';
                            $badge.src = badge.url;
                            if (badge.color) $badge.style.backgroundColor = badge.color;
                            if (badge.description === 'Bot') {
                                $badge.style.backgroundColor = 'rgb(0, 173, 3)';
                                $modBadge.remove();
                            }
                            $badge.src = badge.url;
                            $userInfo.append($badge);
                    
                        });
                    }*/
                    

                    userBadges.forEach(badge => {
                        var $badge = document.createElement('img');
                        $badge.className = 'badge';
                        $badge.src = badge.url;
                        $userInfo.append($badge);
                        // tooltip
                        

                    });

                   // console.log(userBadges)
            
                    message.prepend($userInfo);

                    //console.log(message, messageTextElement)
                    
                    // })
                    mutation.addedNodes[i].querySelector(".message").innerHTML = newMessageHTML;
                    
                }
            }
        }
    });
});

var config = { attributes: true, childList: true, characterData: true };

observer.observe(chit, config);
observer.observe(chat, config);

getEmotes() 