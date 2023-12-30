import mysql from 'mysql'
import express from 'express'
import NodeCache from 'node-cache'

const connection = mysql.createConnection({
   host:"localhost" ,
   database:"employee",
   user:"root",
   password:"root123",
});
const app=express();
app.use(express.json());
const PORT=4000;
const cache=new NodeCache();



app.listen(PORT,()=>{
    console.log(`SERVER : http://localhost:${PORT}`);
    connection.connect((err)=>{
        if(err) throw err;
        console.log("DATABASE CONNECTED");

    })
})



app.get("/fetchbyid/:emp_id", (req, res) => {
    const fetchid = req.params.emp_id;
  // Check if data is in the cache
  const cachedData = cache.get(fetchid);
  if (cachedData) {
    console.log('Data retrieved from cache');
    res.send(cachedData);
  }
  else{
    // Data is not in the cache, fetch from the database
    connection.query('SELECT * FROM empdetail WHERE emp_id = ?',fetchid,(err,result)=>{
        if(err) {
            console.log(err);
        }
        else{
            const cacheTimeInSeconds = 3600;
            cache.set(fetchid, result[0], cacheTimeInSeconds);
            res.send(result[0]); 
        }
    });
  }
});

app.post('/post',(req,res)=>{
  const empid=req.body.emp_id;
  const empname=req.body.emp_name;
  const manager=req.body.manager;
  connection.query('insert into empdetail values (?,?,?)',[empid,empname,manager],(err,result)=>{
    if(err)
    {
      console.log(err);
    }
    else{
      res.send("POSTED");
    }
  });
});

app.put("/update",(req,res)=>{
  const empid=req.body.emp_id;
  const manager=req.body.manager;
  const empname=req.body.emp_name;
  connection.query('update empdetail set manager=?,emp_name=? where emp_id=?',[manager,empname,empid],(err,result)=>{
    if(err)
    {
      console.log(err);
    }
    else{
      res.send("UPDATED");
    }
  });
});

app.delete('/delete/:emp_id',(req,res)=>{
  const empid=req.params.emp_id;
  connection.query('delete from empdetail where emp_id=?',empid,(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send("DELETED");
    }
  });
});

app.use('/all',(req,res)=>{
  connection.query('select * from empdetail',(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      res.send(result);
    }
  });
});