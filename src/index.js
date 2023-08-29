 const path = require('path')
 const http = require('http'
 )
const socketio = require('socket.io')
 const express = require('express')


 const {generateMessage, generateLocationMessage} = require('./utils/messages')

 const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/user')
// let count =0 
 const app = express()
 const server = http.createServer(app)
 const io = socketio(server)


 const PORT = 3000

 const publicDirectoryPath = path.join(__dirname,'../public')

 app.use(express.static(publicDirectoryPath))

 io.on('connection',(socket)=>{
    console.log("New webscoket connection")

    // socket.emit('message',generateMessage('Welcome!'))

    // socket.broadcast.emit('message',generateMessage("A new user is joined"))
    // socket.emit('countUpdated',count)
    // socket.on('increment',()=>{
    //    count++ ;
    //    io.emit('countUpdated',count)
    // })


    socket.on('join',({username,room},callback)=>{
        console.log("safsdfsdsad",username, room)
        const {error,user} = addUser({id:socket.id,username,room})
        if(error){
           return callback(error)  
        }
        console.log(user)
        socket.join(user.room)

        socket.emit('message',generateMessage(user.username,'Welcome!'))

        socket.broadcast.to(user.room).emit('message',generateMessage('General',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        console.log(user)
        if(user){
            io.to(user.room).emit('message',generateMessage(user.username,message))
            callback("Delivered")
        }
        
    })

    socket.on('disconnect',()=>{
        

       const user = removeUser(socket.id)

       if(user){
       io.to(user.room).emit('message',generateMessage(`${user.username} has left`))
       io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })
       }
    })

    socket.on('sendlocation',(cords,callback)=>{
        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q= ${cords.latitude},${cords.longitude}`))
            callback()
        }
        
    })
 })

 server.listen(PORT,()=>{
    console.log("Running on port "+PORT)
 })