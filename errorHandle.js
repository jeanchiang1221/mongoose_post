const headers=require("./headers");
const errorHandle=function(res,error){
    res.writeHead(400,headers);
    res.write(JSON.stringify({
        status:"FALSE",
        message:"網址或輸入內容有誤",
        error:error
    })),
    res.end();
}
module.exports=errorHandle;