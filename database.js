const express = require('express');
const app = express();
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = 'mongodb://127.0.0.1:27017/';
const body = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const bodyparse = body.urlencoded({extended:false})

let imgname = '';
// const upload = multer({ dest: 'uploads/' })


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
       imgname = Date.now() +file.originalname 
       return cb(null, imgname)
    }
  })

const upload = multer({ storage: storage })





const mainpath = path.join(__dirname,"../Public");
app.use(express.static(mainpath));
app.use(express.static('uploads'));



app.set("view engine","ejs")

const client = new MongoClient(url);

async function main() {
    try{
        await client.connect();
        console.log("Database connection established");
        const db = client.db('studentdb');
        const collection = db.collection('studentdb');
        const udata = await collection.find({}).toArray();

        //insert into collection

let editdata = ''

app.get('/form',async(req,res)=>{
    let f = await collection.find({}).toArray();
    res.render('form',{
        data:f,
        editdata:editdata
    })
})

//Delete student
app.get('/del/:id', async (req,res)=>{
    let id = req.params.id;
    
    // let id = req.params.id;
    // id = id-1;
    // udata.splice(id,1)
    // let j=1;
    // udata.forEach((i)=>{
    //     i.id=j;
    //     j++
    // })
    let userdata = await collection.findOne({id:id});
    console.log(userdata);
    imgname = 'uploads/'+userdata.image;
    console.log(imgname);
    fs.unlink(imgname,()=>{
        console.log("deleted");
    });
    let d = await collection.deleteOne({id:id})
    let f = await collection.find({}).toArray();
    
    // res.render('form',{
    //     data:f,
    //     editdata:editdata
    // })
    res.redirect('/form')

})


app.post('/savedata',upload.single('image'), async (req,res)=>{
    id = req.body.id;
    gamme = req.body.name;
    editdata= '';
    editdata = udata.find((i)=> i.id==id)
    let oldimg = (imgname!= '')?imgname:'';

    
    if(id != ''){
        if(req.file && imgname != ''){
            let img = 'uploads/'+editdata.image
            fs.unlink(img,()=>{
                console.log("deleted");
            })
        }
        // console.log("id is " + id)
        //update
      
        udata.find((i)=>{
            if(i.id==id){
                i.name = req.body.name;
                i.age = req.body.age
                i.image = (req.file && imgname!= '')?imgname:oldimg;
            }


        })
        
        let finalUpdate = await collection.updateOne({
            id:id
        },{ $set:{
            name:req.body.name,
            age:req.body.age,
            image:(imgname!= undefined)?imgname:oldimg 
        }})
        console.log(finalUpdate)
    }
    else{
        if(gamme != ''){
        //push
        let ide = udata.length+1
    let data = {
        id: ide.toString(),
        name:req.body.name,
        age:req.body.age,
        image:imgname
    }
    
    udata.push(data);
    let result = await collection.insertOne(data);
    }
}
   editdata = '';
  
    res.redirect('/form')

})


app.get('/edit/:id',(req,res)=>{
    let id = req.params.id;
    // console.log(name);
     editdata = udata.find((i)=>i.id == id);
        res.render('form',{
            data:udata,
            editdata:editdata
        })
   
})


app.get('/',(req,res)=>{
    res.write("<h1>Hello World</h1>")
    res.send()
})


// app.get('/savedata',(req,res)=>{
//     res.write("Name is"+ req.query.name)
//     res.write("Email is" + req.query.email)
//     res.send()
// })
        
    }
    catch(err){
        console.log(err);
    }
}
main();

app.listen(8000,()=>{
    console.log("Database connection established");
})





