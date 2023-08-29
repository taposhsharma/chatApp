const socket = io()


const  $messageForm = document.querySelector('#message-form')

const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $message = document.querySelector('#messages')
// console.log($message)
const messageTemplate = document.querySelector('#message-template').innerHTML

const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix: true})


const autoscroll = ()=>{
    const $newMessage = $message.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)

    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    const visibleHeight = $message.offsetHeight
    const containerHeight = $message.scrollHeight
    

    const scrollOffset = $message.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
             $message.scrollTop=$message.scrollHeight
    }
}

socket.on('roomData',({room,users})=>{
    console.log(users)
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})
socket.on('message',(mess)=>{
    console.log(mess)

    const html = Mustache.render(messageTemplate,{
        username:mess.username,
        mess:mess.text,
        createdAt:moment(mess.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('locationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render(locationMessageTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
    
})
// socket.on('countUpdated',(count)=>{
//     console.log("the count has been updated! " + count)
// })


// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log("clicked")
//     socket.emit('increment')
// })


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()


    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(mess)=>{
        $messageFormButton.removeAttribute('disabled')

        $messageFormInput.value = ''
        $messageFormInput.focus()
         console.log("eeiouieouo" +mess)
    })
})

const $location = document.querySelector('#send-location')

$location.addEventListener('click',()=>{
     if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
     }   

     $location.setAttribute('disabled','disabled')

        navigator.geolocation.getCurrentPosition((position)=>{
           socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude 
           },()=>{
              $location.removeAttribute('disabled')
               console.log('Location Shared')
           })
        })
    
})


socket.emit('join',{username,room} ,(error)=>{
        if(error){
            alert(error)
            location.href='/'
        }
})