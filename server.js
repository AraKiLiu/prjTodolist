const http = require('http');
const mongoose = require('mongoose');

const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const errHandle = require('./errorHandle');
const config = require('./config');
const todos = [];

mongoose.connect('mongodb://localhost:27017/hotel')
.then(()=>{
    console.log('資料庫連線成功')
})
.catch((error)=>{
    console.log(error)
});

const requestListener = (req, res)=>{
    let body = "";
    req.on('data', chunk=>{
        body+=chunk;
    })
    
    //Get
    if(req.url=="/todos" && req.method == "GET")
    {
        res.writeHead(200,config.headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    }
    //Post
    else if(req.url=="/todos" && req.method == "POST")
    {
        req.on('end',()=>{
            try{
                const title = JSON.parse(body).title;
                if(title !== undefined){
                    const todo = {
                        "id": uuidv4(),
                        "title": title
                    };
                    todos.push(todo);
                    res.writeHead(200,config.headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                }else{
                    errHandle(res,"資料不正確");
                }
                
            }catch(error){
                errHandle(res,error.message);
            }
            
        })
    }
    //Delete
    else if(req.method == "DELETE")
    {
        if(req.url=="/todos")
        {
            todos.length=0;
            res.writeHead(200,config.headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos,
            }));
            res.end();
        }
        else if(req.url.startsWith("/todos/"))
        {
            const id = req.url.split('/').pop();
            const index= todos.findIndex(element =>element.id==id);
            if(index !== -1)
            {
                todos.splice(index,1);
                res.writeHead(200,config.headers);
                res.write(JSON.stringify({
                    "status": "success",
                    "data": todos,
                }));
                res.end();
            }
            else
            {
                errHandle(res,"沒有這筆資料");
            }
        }
        else
        {
            res.writeHead(200,config.headers);
            res.end();
        }
    }
    
    //Patch
    else if(req.url.startsWith("/todos/") && req.method == "PATCH")
    {
        req.on("end",()=>{
            try {
                const todo =JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index=todos.findIndex(element=> element.id==id);
                if(todo !== undefined && index !== -1){
                    todos[index].title=todo;
                    res.writeHead(200,config.headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                }else{
                    errHandle(res,"沒有這筆資料");
                }
            } catch (error) {
                errHandle(res,error.message);
            }
        })
    }
    //Options
    else if(req.method == "OPTIONS")
    {
        res.writeHead(200,config.headers);
        res.end();
    }
    else
    {
        res.writeHead(404,config.headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站路由"
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3003);