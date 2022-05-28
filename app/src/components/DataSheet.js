import React, { Component, Fragment } from 'react'
import axios from 'axios'
import { Student } from './Student'


export class DataSheet extends Component {

    state = {
        gpa: 0,
        courses: [],
        student: {},
        regs: [],
        grades: []
    }

    setStudent = (s) => {
        console.log(s)
        this.setState({ student: { ...s[0][0] }, courses: s[1] });
        // this.getCourses();
    };

    setRegistrations = (data) => {
        const [regs, grades, gpa] = data;
        //console.log(regs, grades, gpa);
        this.setState({ grades, regs, gpa: gpa !== null ? gpa.gpa : 0 });
    };

    getCourses = () => {
        //console.log(this.state.student)
        axios.get(`/api/courses/${this.state.student.regno}`).then(res => {
            const [courses, gpa] = res.data
            //console.log(courses, gpa)
            this.setState({ courses, gpa: gpa !== null ? gpa.gpa : 0 })
        })
    }

    handleClick = async (cid) => {
        //console.log({courseid: cid, regno: this.state.student.regno, gradeid: null})
        await axios.post(`/api/registrations/add`,
            {
                courseid: cid,
                regno: this.state.student.regno,
                gradeid: null
            });
        this.getCourses()

    }

    handleChange = async (e) => {
        const { name, value } = e.target;
        await axios.patch(`/api/registrations/update`, { _id: name, gradeid: value })
        //console.log(result)
        this.getCourses()
    }

    render() {
        return (
            <Fragment>
                <Student
                    setStudent={this.setStudent}
                    setRegistrations={this.setRegistrations}
                    student={this.state.student}
                />
                <br />
                <div style={{ display: 'flex' }} className="container-1">
                    <div>
                        {Object.keys(this.state.student).length !== 0 && (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Title</th>
                                        <th>Sem</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.courses.map(c => (
                                        <tr key={c._id} style={{ cursor: 'pointer', userSelect: 'none', color: c.reg !== undefined ? '#d3d3d3' : 'black' }}>
                                            <td>{c.courseid}</td>
                                            {c.reg !== undefined
                                                ? (<td>{c.code} {c.title}</td>)
                                                : (<td onDoubleClick={() => this.handleClick(c.courseid)}>{c.code} {c.title}</td>)
                                            }
                                            <td>{c.semester}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div></div>
                    <div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Title</th>
                                    <th>CrHr</th>
                                    <th>Grade</th>
                                    <th>GPA</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.courses.map((c) => {
                                    return (
                                        <tr key={c._id} style={{ color: c.reg !== undefined ? 'black' : '#d3d3d3' }}>
                                            <td>{c.code}</td>
                                            <td>{c.title}</td>
                                            <td>{c.crhr}</td>
                                            <td>
                                                {c.reg !== undefined ? (
                                                    <select name={c.reg._id} value={c.reg.gradeid || ''} onChange={this.handleChange}>
                                                        <option hidden value=''></option>
                                                        {this.state.grades.length !== 0 &&
                                                            this.state.grades.map((g) => (
                                                                <option key={g.gradeid} value={g.gradeid}>
                                                                    {g.grade}
                                                                </option>
                                                            ))}
                                                    </select>
                                                ) : ''}
                                            </td>

                                            <td>{c.grade !== undefined && c.grade.gpa}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>

                            </tfoot>
                        </table>


                    </div>
                    <div>
                        <strong>
                            GPA: 
                        </strong>
                            {this.state.gpa.toFixed(2)}
                    </div>
                    <pre style={{ textAlign: 'left' }}>{
                        //JSON.stringify(this.state, null, 2)
                    }</pre>
                </div>
            </Fragment>
        )
    }
}

export default DataSheet