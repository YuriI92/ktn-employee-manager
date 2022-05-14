const promptOption = require('./utils/questions');

promptOption()
.catch(err => {
    console.log(err);
});
