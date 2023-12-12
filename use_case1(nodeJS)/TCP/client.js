const net = require('net');
const readline = require('readline')
const {stdin : input, stdout : output} = require('process');
const rl = readline.createInterface({input,output});

const yargs  = require ('yargs');
const {hideBin} = require('yargs/helpers');
var args = yargs (hideBin(process.argv)).argv;


var client = new net.Socket();

var name = args.name;
var port = args.port||"8080";
var host = args.host||'127.0.0.1';

/*change environment's variable in order to improve the flexibility of the connection*/


/*if (process.argv.length >=4 && process.argv[2].includes('port') && process.argv[3].includes('host')){
    port = process.argv[2].substring (process.argv[2].search('=')+1)
    host = process.argv[3].substring (process.argv[3].search('=')+1)
}
else {
    port = "8080"; host ="127.0.0.1";
}
*/
if (args.name ==null){
    name = "client";
}
/** to assert that the connection attempt successfully */
client.connect(port, host, function() {
    
    console.log('Connected');
    client.write(JSON.stringify({from : name, action : "client-hello"}));
    rl.resume();
    
    
});
/*to access data which has been read from the server*/
client.on('data', function(data) {
    msg = JSON.parse(data);
    switch (msg.action){
        /***************Début TD3**********/ 
        case "server-hello":
            console.log(msg.description);   
            break;

        case "hello-notifier":
            console.log(msg.description);   
            break;

        case "foward":
                console.log(msg.description);  
            break;

        case "broadcast":
            console.log(msg.description);  
            break;

        case "list":
            console.log(msg.description);
            console.log(msg.msg);
            
            break;

        case "quit":
            console.log(msg.description); 
            break;

        case "quit-attestation" : 
            console.log(msg.description); 
            break;
            /***************Fin TD3**********/ 
        case "create-group":
            console.log(msg.description); 
            break;

        case "join-group":
            console.log(msg.description); 
            break;

        case "group-broadcast":
            console.log(msg.description); 
            break;

        case "group-members":
            console.log(msg.description)
            console.log(msg.msg)
            
            break;

        case "group-messages":
            console.log(msg.description)
            console.log(msg.msg)
            
            break;

        case "groups-list":
            console.log(msg.description)
            console.log(msg.msg)
            
            break;

        case "group-leave":
            console.log(msg.description); 
            break;

        case "group-invitation":
            console.log(msg.description); 
            break;

        case "invitation-feedback":
            console.log(msg.description); 
            break;

        case "group-kick":
            console.log(msg.description); 
            break;

        case "kick-feedback":
            console.log(msg.description); 
            break;

        case "group-ban":
            console.log(msg.description); 
            break;

        case "ban-feedback":
            console.log(msg.description); 
            break;

        case "group-unban":
            console.log(msg.description); 
            break;

        case "unban-feedback":
            console.log(msg.description); 
            break;

        case "group-events":
            console.log(msg.description)
            console.log(msg.msg)
            
            break;
        default:
            rl.prompt(true)
    }

})
rl.on('line', (input) => {
    let inputs = input.split(";");
    switch (inputs[0]){
        /***************Début TD3**********/ 
        case "s":    
            client.write(JSON.stringify({from:name, 
                                        to : inputs[1],
                                        msg : inputs[2],
                                        action : 'client-send'
                                        }));
            break;

        case "b" :
            client.write(JSON.stringify({from : name,
                                        msg : inputs[1],
                                        action : 'client-broadcast'
                                        }));
            break;

        case "ls":
            client.write(JSON.stringify({from : name,
                                         action:'client-list-clients'
                                        }));
            break;

        case "q":
            client.write(JSON.stringify({from : name,
                                         action :'client-quit'

            }));
            break;
        /***************Fin TD3**********/ 

        /***************Début TD4**********/ 
        case "cg" : 
            client.write(JSON.stringify({from : name,
                                         group : inputs[1],
                                         action : 'cgroup'
                                        }));
            break;

        case "j" : 
            client.write(JSON.stringify({from : name,
                                         group : inputs[1],
                                         action : 'join'
                                        }));
            break;

        case "bg":
            client.write(JSON.stringify({from : name,
                                          group : inputs[1],
                                          msg : inputs[2],
                                          action : 'gbroadcast'

                                        }));
            break;

        case "members":
            client.write(JSON.stringify({from : name,
                                         group : inputs[1],
                                         action : 'members'
                                        }));
            break;

        case "messages":
            client.write(JSON.stringify({from : name,
                                         group : inputs[1],
                                         action : 'msgs'
                                        }));
            break;

        case "groups":
            client.write(JSON.stringify({from : name,
                                         action : 'groups'
                                        }));
            break;

        case "leave":
            client.write(JSON.stringify({from : name,
                                         group : inputs[1],
                                         action : 'leave'
                                        }));
            break;

        case "invite":    
            client.write(JSON.stringify({from : name, 
                                         group : inputs[1],
                                         to : inputs[2],
                                         action : 'invite'
                                        }));
            break; 

        case "kick":    
            client.write(JSON.stringify({from : name, 
                                         group : inputs[1],
                                         to : inputs[2],
                                         reason : inputs[3],
                                         action : 'kick'
                                        }));
            break;  

        case "ban":    
            client.write(JSON.stringify({from : name, 
                                         group : inputs[1],
                                         to : inputs[2],
                                         reason : inputs[3],
                                         action : 'ban'
                                        }));
            break;

        case "unban":    
            client.write(JSON.stringify({from : name, 
                                         group : inputs[1],
                                         to : inputs[2],
                                         action : 'unban'
                                        }));
            break;

        case "states":    
            client.write(JSON.stringify({from : name, 
                                         group : inputs[1],
                                         action : 'states'
                                        }));
            break;   
        
    }

});
