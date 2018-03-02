
const crypto = require('crypto');

const tasks = {
};

let etag = crypto.createHash('sha1').update(JSON.stringify(tasks));
let digest = etag.digest('hex');

const respondJSON = (request, response, status, object) => {
    
    const headers = {
        'Content-Type': 'application/json',
        etag: digest,
    };
    
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
    
};


const respondJSONMeta = (request, response, status) => {
    
      const headers = {
        'Content-Type': 'application/json',
        etag: digest,
    };
    
  response.writeHead(status, headers);
  response.end();
    
};


const getTasks = (request, response) => {
    
  const responseJSON = {
    tasks,
  };
 return respondJSON(request, response, 200, responseJSON);
};

const getTaskMeta = (request, response) => {
  if(request.headers['if-none-match'] === digest){
      return respondJSONMeta(request, response, 304);
  }  
};


const notFound = (request, response) => {
  const responseJSON = {
      message: 'Cannot find the page you are looking for',
      id:'notFound',
  } 
  
  respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => {
    respondJSONMeta(request, response, 404);
}


const addTask = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Task Title, Task Description and status are all required',
  };

  if (!body.title || !body.description || !body.status) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;


  if (tasks[body.title]) {
    responseCode = 204;
  } else {
    tasks[body.title] = {};
    tasks[body.title].title = body.title;
    tasks[body.title].dateToComp = body.dateToComp;
    tasks[body.title].imgurl = body.imgurl;
    tasks[body.title].status = body.status;
    tasks[body.title].description = body.description;
    tasks[body.title].urgent = body.urgent;
    tasks[body.title].important = body.important;
    tasks[body.title].dateadded = body.dateadded;
  }



  
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }
    
  return respondJSONMeta(request, response, responseCode);
};


const getTaskPage = (request, response, type) => {
    
    let fixedType = decodeURI(type);
    
    const requestedTask = tasks[fixedType];
    
    const responseJSON = {
        requestedTask,
    };
    return respondJSON(request, response, 200, responseJSON);
};

const filterTasks = (request, response, query) => {
    const querys = query.split('=');
    let filteredTasks = {}; 
    
    let keys = Object.keys(tasks);
    
    if(querys[1] === 'all'){
        return getTasks(request, response);
    } else {
    
    for(let i = 0; i < keys.length; i++){
    
        if(tasks[keys[i]].type === querys[1]){
            
            if(filteredTasks[tasks[keys[i]].title]){
               // empty
            }else{
            filteredTasks[tasks[keys[i]].title] = tasks[keys[i]];
            }
        }
    };
    }
    
     const responseJSON = {
        filteredTasks,
     };
    
     return respondJSON(request, response, 200, responseJSON);
};



// public exports
module.exports = {
  getTasks,
    getTaskMeta,
    notFound,
    notFoundMeta,
    addTask,
    getTaskPage,
    filterTasks,
};
