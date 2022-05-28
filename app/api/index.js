const router = require('express').Router()
const db = require('../models')

router.get('/courses/', async (req, res)=>{
    const courses = await db.Course.find().sort({ semester: 1, courseid: 1 })
    res.status(200).json(courses)
})

router.get('/courses/:regno', async (req, res)=>{
    Promise.all([
        db.Course.aggregate([
            { $lookup: { from: 'registrations',localField: 'courseid', foreignField: 'courseid',as: 'reg',pipeline:[{"$match":{"regno":req.params.regno}}]}},
            { $unwind: { path: "$reg", preserveNullAndEmptyArrays: true }}, 
            { $lookup: { from: 'grades',localField: 'reg.gradeid', foreignField: 'gradeid',as: 'grade',}},
            { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } } 
        ]).sort({ semester: 1, courseid: 1 }),  
        db.Registration.aggregate([
            { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
            { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
            { $unwind : "$course" }, 
            { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
            { $unwind: "$grade" },
            { $group: {_id: null, tcr: { $sum: "$course.crhr"}, tgpa: { $sum: { $multiply: ["$course.crhr", "$grade.gpa"]}}}},
            { $project: {_id: 0, gpa: {$divide: ["$tgpa", "$tcr"]}}}
        ]) 
    ])
    .then(([courses, gpa]) => res.status(200).json([courses, gpa[0]]))
    
})

router.patch('/registrations/update', async (req, res)=>{
    console.log('Params :>> ', req.body);

    let result = await db.Registration.updateOne({ _id: req.body._id }, {
        $set: {
            gradeid: req.body.gradeid
        }
    })

    res.status(200).json(result);
})

router.post('/registrations/add', async (req, res)=>{
    console.log(req.body)
    const result = await new db.Registration(req.body).save()
    res.status(200).json(result);
})

router.get('/registrations/:regno', async (req, res)=>{
    Promise.all([
        db.Registration.aggregate([
            { $match : { regno : req.params.regno } },
            { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
            { $unwind : "$course" }, 
            { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
            { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } }
        ]), 
        db.Grade.find().sort({ gradeid: 1}),
        db.Registration.aggregate([
            { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
            { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
            { $unwind : "$course" }, 
            { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
            { $unwind: "$grade" },
            { $group: {_id: null, tcr: { $sum: "$course.crhr"}, tgpa: { $sum: { $multiply: ["$course.crhr", "$grade.gpa"]}}}},
            { $project: {_id: 0, gpa: {$divide: ["$tgpa", "$tcr"]}}}
        ])        
    ])
    .then(([regs, grades, gpa]) => {
        res.status(200).json([regs, grades, gpa[0]]);    
    });      
})

router.get('/students/:regno', async (req, res)=>{
    Promise.all([
        db.Student.find({ regno: req.params.regno }), 
        db.Course.aggregate([
            { $lookup: { from: 'registrations',localField: 'courseid', foreignField: 'courseid',as: 'reg',pipeline:[{"$match":{"regno":req.params.regno}}]}},
            { $unwind: { path: "$reg", preserveNullAndEmptyArrays: true }}, 
            { $lookup: { from: 'grades',localField: 'reg.gradeid', foreignField: 'gradeid',as: 'grade',}},
            { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } } 
        ]).sort({ semester: 1, courseid: 1 })       
    ])
    .then(([student, courses]) => {
        res.status(200).json([student, courses]);    
    });     
})

router.patch('/update', async (req, res)=>{
    //const student = await db.Student.find({ regno: req.params.regno })
    //res.status(200).json(student[0])
    console.log(req.body);
    const result = await db.Student.findOneAndUpdate(
        { regno: req.body.regno }, 
        { $set: req.body }, 
        { new: true }
    )

    res.status(200).json(result)


})

// const db = require('../models');
// const Registration = require('../models/Registration');

exports.addRegistration = (req, res) => {
    //console.log(req.body);

    let courseids = JSON.parse(req.body.courseids)

    let regs = [];

    for(courseid of courseids){
        regs.push(new Registration({courseid: courseid, regno: req.body.regno, gradeid: null}));
    }
    //console.log(regs);

    db.Registration.insertMany(regs)
    .then(regs => {
        res.status(200).json(regs);    
    });    
}

exports.updateRegistration = async (req, res) => {
    console.log('Params :>> ', req.body);

    let result = await db.Registration.updateOne({ _id: req.body.id }, {
        $set: {
            gradeid: req.body.gradeid
        }
    })

    res.status(200).json(result);

}

exports.getUpdatedGPA = async (req, res) => {
    db.Registration.aggregate([
        { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
        { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
        { $unwind : "$course" }, 
        { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
        { $unwind: "$grade" },
        { $group: {_id: null, tcr: { $sum: "$course.crhr"}, tgpa: { $sum: { $multiply: ["$course.crhr", "$grade.gpa"]}}}},
        { $project: {_id: 0, gpa: {$divide: ["$tgpa", "$tcr"]}}}
    ])
    .then(gpa => {
        res.status(200).json(gpa[0]);    
    });      
}


exports.getRegistrationsByRegNo = (req, res) => {
    Promise.all([
        db.Registration.aggregate([
            { $match : { regno : req.params.regno } },
            { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
            { $unwind : "$course" }, 
            { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
            { $unwind: { path: "$grade", preserveNullAndEmptyArrays: true } }
        ]), 
        db.Grade.find().sort({ gradeid: 1}),
        db.Registration.aggregate([
            { $match : { regno : req.params.regno, gradeid: { $ne: null } } },
            { $lookup: { from: 'courses', localField: 'courseid',  foreignField: 'courseid', as: 'course'}}, 
            { $unwind : "$course" }, 
            { $lookup: { from: 'grades', localField: 'gradeid',  foreignField: 'gradeid', as: 'grade'}},
            { $unwind: "$grade" },
            { $group: {_id: null, tcr: { $sum: "$course.crhr"}, tgpa: { $sum: { $multiply: ["$course.crhr", "$grade.gpa"]}}}},
            { $project: {_id: 0, gpa: {$divide: ["$tgpa", "$tcr"]}}}
        ])        
    ])
    .then(([regs, grades, gpa]) => {
        res.status(200).json([regs, grades, gpa[0]]);    
    });      
}


module.exports = router