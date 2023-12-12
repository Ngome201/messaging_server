var net = require('net');
var process = require ('node:process');
var port = "";
var host = '';
var users = [];
var list = [];
var groups = new Map();
var touch ;
var ind;

var findUserBySocket = function (users, name){
    //this function returns the socket of the corresponding client
    var client = null, i=0;
    
    while(client==null && i<users.length){
        if (name == users[i].name){
            client = users[i].socket;
            return client;
        }
        i++;
    }
}


/*change environment's variable in order to improve the flexibility of the connection*/
if (process.argv.length >=4 && process.argv[2].includes('port') && process.argv[3].includes('host')){
    port = process.argv[2].substring (process.argv[2].search('=')+1)
    host = process.argv[3].substring (process.argv[3].search('=')+1)
}
else {
    // pour une connexion via wifi port = "3000"; host ="192.168.43.161";
    port = "8080"; host ="127.0.0.1"
}

var server = net.createServer((socket)=>{
    
    console.log('CONNECTED from ' + socket.remoteAddress + ':' + socket.remotePort);
    socket.on('data', function(data) {
            
            msg = JSON.parse(data);
            
            console.log('DATA received from ' + socket.remoteAddress + ':' + data);
            
            switch(msg.action){
                
                /***************Début TD3**********/ 
                case "client-hello":
                    users.push({name : msg.from, socket : socket});

                    socket.write(JSON.stringify({
                                                 action : "server-hello",
                                                 description: "welcome "+msg.from
                                                                
                                                }))
                    for(let i=0;i<users.length;i++){
                        if(msg.from != users[i].name){
                            users[i].socket.write(JSON.stringify({
                                                                  description: "server> "+msg.from + " is connected",
                                                                  action : "hello-notifier"
                                                                }))
                        }
                        
                    }                               
                    break;

                case "client-send":
                    
                    findUserBySocket(users,msg.to).write(JSON.stringify({
                                                                         description :`Received from ${msg.from} : ${msg.msg}`,
                                                                         action : "foward"
                                                    })); 
                    
                    break;

                case "client-broadcast":
                    for(let i=0;i<users.length;i++){
                        if(msg.from!=users[i].name){
                            users[i].socket.write(JSON.stringify({
                                                                description : `Received from ${msg.from} : ${msg.msg}`,
                                                                action : "broadcast",
                                                                }));
                        }
                    }
                    break;

                case "client-list-clients":
                    
                    list = users.map((element) =>  element.name)
                    console.log(list)
                    socket.write(JSON.stringify({msg : list,
                                                 description : "server> list of all connected users : ",
                                                 action : "list"
                                                }));
                    
                    break;

                case "client-quit":
                    let user = findUserBySocket(users,msg.from);
                    
                    for(let i=0;i<users.length;i++){
                        users[i].socket.write(JSON.stringify({
                                                              description :`server> ${msg.from} is disconnected`,
                                                              action : "quit" 
                                                            }));
                    }
                    socket.write(JSON.stringify({
                                                 description : `server> you have been disconnected`,
                                                 action : "quit-attestation"
                                                }));

                    user.destroy()
                    break;
                
                /***************FIN TD3**********/ 
                
                /***************Début TD4**********/
                case "cgroup":
                    let members = [];
                    let messages = [];
                    let kick = [];
                    let ban = [];
                    let events =[];
                    members.push(msg.from)

                    let element = { group_members: members,
                                    group_messages : messages,
                                    kick_members : kick,
                                    ban_members : ban,
                                    group_events : events,
                                    };// un element est un objet litteral qui contient tous les items relatifs à un groupes
                    groups.set(msg.group,element) //les clés du dictionnaire sont les noms de groupe
                    console.log(groups)
                    socket.write (JSON.stringify({msg : groups.get(msg.group).group_members,
                                                  description : `server> group ${msg.group} created successfully`,
                                                  action: 'create-group'
                                                }))
                    break;

                case "join":
                    touch = groups.get(msg.group) //on recupere le groupe dont le nom correspond 
                    touch.group_members.push(msg.from)//on ajoute l'utilisateur à la liste des membres du groupe
                    
                    socket.write (JSON.stringify({msg : groups.get(msg.group).group_members,
                                                  description : "server> you joined the group successfully",
                                                  action: 'join-group'
                                                }))
                    touch.group_events.push(`${msg.from} joined the group`)
                    break;

                case "gbroadcast":
                    touch = groups.get(msg.group)
                    let T = touch.group_members
                    for(let i=0;i<T.length;i++){
                        if (msg.from != T[i]){
                            let u =findUserBySocket(users,T[i])
                            u.write(JSON.stringify({
                                                    description : `${msg.group}> ${msg.from} : ${msg.msg}`,
                                                    group : msg.group,
                                                    action : "group-broadcast",
                                                    }));
                        }
                    }
                    touch.group_messages.push(msg.from + " : " + msg.msg)
                    break;  

                case "members":
                    socket.write (JSON.stringify({msg : groups.get(msg.group).group_members,
                                                  description : `server> list of all the members of the group ${msg.group}`, 
                                                  action: 'group-members'
                                                }))
                    break;

                case "msgs":
                    socket.write (JSON.stringify({msg : groups.get(msg.group).group_messages,
                                                  description : `server> list of all the messages of the group ${msg.group}`,
                                                  action: 'group-messages'
                                                 }))
                    break;

                case "groups":
                    let cle = [];
                    let val ;
                    let group_key = groups.keys()
                    //the instructions below extract the value of the keys and map them in the table val
                    while(true){
                        val = group_key.next().value 
                        if(val == undefined) break;
                        cle.push(val)
                    }
                    console.log(cle)
                    socket.write (JSON.stringify({msg : cle,
                                                  description : "server> list of all existing groups",
                                                  action: 'groups-list'
                      }))
                    break;

                case "leave":
                    touch = groups.get(msg.group)
                    ind = touch.group_members.indexOf(msg.from)
                    if (ind!=-1) touch.group_members.splice(ind,1)
                    socket.write (JSON.stringify({group : msg.group,
                                                  description : `server> vous avez quitté le groupe ${msg.group}`,
                                                  action: 'group-leave'
                                                }))
                    touch.group_events.push(`${msg.from} leaved the group`)
                    break;

                case "invite":
                    //this is an obvious functionnality. Is it invite or add a person to a group
                    touch = groups.get(msg.group)
                    touch.group_members.push(msg.to)
                    socket.write (JSON.stringify({
                                                  description : `server> you successfully added ${msg.to} to the group :${msg.group} `,
                                                  action: 'group-invitation'
                                                }))
                    
                    findUserBySocket(users,msg.to).write(JSON.stringify({
                                                  description : `server> you have been added by ${msg.from} to the group : ${msg.group}`,
                                                  action: 'invitation-feedback'

                                                }))
                    touch.group_events.push(`${msg.from} invited ${msg.to}`)
                    break;

                case "kick":
                    touch = groups.get(msg.group)
                    ind = touch.group_members.indexOf(msg.to)
                    if (ind!=-1) touch.group_members.splice(ind,1)
                    else break;
                    socket.write (JSON.stringify({group : msg.group,
                                                  description : `server> you have dismissed ${msg.to} from ${msg.group} `,
                                                  action: 'group-kick'
                                                }))

                    findUserBySocket(users,msg.to).write(JSON.stringify({
                                                  description : `server> you have been dismissed by ${msg.from} to the group : ${msg.group} because${msg.reason}`,
                                                  action: 'kick-feedback'

                                                }))
                    touch.kick_members.push(msg.to)
                    touch.group_events.push(`${msg.from} kicked ${msg.to}`)
                    break;

                case "ban":
                    touch = groups.get(msg.group)
                    ind = touch.group_members.indexOf(msg.to)
                    if (ind!=-1) touch.group_members.splice(ind,1)
                    else break;
                    socket.write (JSON.stringify({group : msg.group,
                                                  description : `server> you have dismissed ${msg.to} from ${msg.group} `,
                                                  action: 'group-ban'
                                                }))
    
                    findUserBySocket(users,msg.to).write(JSON.stringify({
                                                  description : `server> you have been dismissed by ${msg.from} to the group : ${msg.group} because${msg.reason}`,
                                                  action: 'ban-feedback'
                                                }))
                    touch.ban_members.push(msg.to)
                    touch.group_events.push(`${msg.from} kicked ${msg.to}`)
                    break;

                case "unban":
                    touch = groups.get(msg.group)
                    ind = touch.ban_members.indexOf(msg.to)
                    if (ind!=-1) touch.ban_members.splice(ind,1)
                    else break;
                    socket.write (JSON.stringify({group : msg.group,
                                                  description : `server> you have admitted ${msg.to} from ${msg.group} `,
                                                  action: 'group-unban'
                                                }))
    
                    findUserBySocket(users,msg.to).write(JSON.stringify({
                                                  description : `server> you have been admitted by ${msg.from} to the group : ${msg.group}`,
                                                  action: 'unban-feedback'
                                                }))
                        
                    touch.group_members.push(msg.to)
                    touch.group_events.push(`${msg.to} has been admitted by ${msg.from}`)
                    break;

                case "states":
                    socket.write (JSON.stringify({msg : groups.get(msg.group).group_events,
                                              description : `server> list of all the events of the group ${msg.group}`,
                                              action: 'group-events'
                                             }))
                    break;
                        
            }
        });
    }).listen(port, host);

