import axios from 'axios';
import React, { Component } from 'react';
//const URL = process.env.REACT_APP_API_URL;

export class Student extends Component {
	handleKeyPress = (e) => {
		if (e.which === 13) {
			//console.log('Enter Pressed');
			// this.setState({ regno: e.target.value });
			axios.get(`/api/students/${e.target.value}`).then((res) => {
				this.props.setStudent(res.data);
				//console.log(data);
			});
			axios.get(`/api/registrations/${e.target.value}`).then((regs) => {
				this.props.setRegistrations(regs.data);
				//console.log(regs.data);
			});
		}
	};

	render() {
		return (
			<div style={{ display: 'flex', justifyContent: 'space-between', width: '600px'}}>
				<table>
					<tbody>
						<tr>
							<th>Regno : </th>
							<td>
								<input type='text' name='regno' onKeyPress={this.handleKeyPress}  size='5'/>
							</td>
						</tr>
					</tbody>
				</table>
				
                {Object.keys(this.props.student).length !== 0 && (
					<table style={{paddingLeft: '10px'}}>
						<tbody>
							<tr>
								<th>Name : </th>
								<td>{this.props.student.studentname}</td>
								<th>Father : </th>
								<td>{this.props.student.fathername}</td>
							</tr>
						</tbody>
					</table>
				)}

				{/* <div>
					<pre>{JSON.stringify(this.props, null, 2)}</pre>
				</div> */}
			</div>
		);
	}
}

//export default Student
