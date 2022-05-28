const mongoose = require('mongoose');
const db = require('./models');

// db.Student.find((err, docs) => {
//     console.log(JSON.stringify(docs, null, 2))
// });

db.Course.aggregate([
    { $lookup: { from: 'registrations',localField: 'courseid', foreignField: 'courseid',as: 'reg',pipeline:[{"$match":{"regno":'1112101'}}]}},
    { $unwind: { path: "$reg", preserveNullAndEmptyArrays: true }}, 
    { $lookup: { from: 'grades',localField: 'reg.gradeid', foreignField: 'gradeid',as: 'grade',}},
    { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } } 
]).sort({ semester: 1, courseid: 1 })
.then(res => console.log(JSON.stringify(res, null, 2))) 

// { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
// { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } }





