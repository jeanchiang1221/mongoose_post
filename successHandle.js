const headers=require("./headers");

const successHandle=function(res,posts){
    res.writeHead(200,headers);
    res.write(JSON.stringify({
        status:"SUCCESS",
        data:posts
    })),
    res.end();
}

module.exports=successHandle;