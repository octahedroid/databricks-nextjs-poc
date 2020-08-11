import React from 'react';
import fetch from 'isomorphic-unfetch';
import styled from 'styled-components';

const SpaceAroundContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const DropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

const Dropdown = styled.div`
  cursor: pointer;
  position: absolute;
  margin-top: 37px;
  background: white;
  width: 299px;
  border-radius: 4px;
  ${({active}) => active && `
    border: solid 1px;  
  `}
`;

const Selected = styled.div`
  border: solid 1px;
  border-radius: 4px;
  height: 25px;
  padding: 5px;
`;

export async function getStaticProps() {
  return {
    props: {
      departments: await retrieveDepartments(),
      offices: await retrieveOffices(),
      jobs: await retrieveJobs(),  
    }
  }
}

export default class Careers extends React.Component {
  constructor() {
    super();
    this.state = {
      departmentListOpen: false,
      officeListOpen: false,
      selectedDepartment: 'Select Department',
      selectedOffice: 'Select Office',
    }
  }

  handleClickOutside = () => {
    this.setState({ departmentListOpen: false });
  }

  toggleDepartmentList = () => {
    this.setState({ departmentListOpen: !this.state.departmentListOpen });
  }

  toggleOfficeList = () => {
    this.setState({ officeListOpen: !this.state.officeListOpen });
  }

  handleSelectedDepartment = (selected) => {
    this.setState({ selectedDepartment: selected });
  }

  handleSelectedOffice = (selected) => {
    this.setState({ selectedOffice: selected });
  }

  render() {
    const parentJobs = this.props.jobs[0];
    const childJobs = this.props.jobs[1];
    const { departments, offices } = this.props;
    return (
      <div>
        {console.log(offices)}
        <SpaceAroundContainer>
          <DropdownContainer onClick={() => this.toggleDepartmentList()}>
            <Selected>
              {this.state.selectedDepartment}
            </Selected>
            <Dropdown active={this.state.departmentListOpen}> 
              {this.state.departmentListOpen && 
                <ul style={{listStyle: 'none'}}>
                  <li key='all' onClick={() => this.handleSelectedDepartment('All Departments')}>All Departments</li>
                  {Object.entries(departments).map((parent, index) => {
                    return (
                      <div>
                        <li key={index} onClick={() => this.handleSelectedDepartment(parent[0])}>
                          {parent[0]}
                        </li>
                        {parent[1].map((child, index) => {
                          return (
                            <li style={{paddingLeft: '20px'}} key={index} onClick={() => this.handleSelectedDepartment(child)}>
                              {child}
                            </li>
                          )
                        })}
                      </div>
                    )
                  })}
                </ul>
              }
            </Dropdown>
          </DropdownContainer>
          <DropdownContainer onClick={() => this.toggleOfficeList()}>
            <Selected>
              {this.state.selectedOffice}
            </Selected>
            <Dropdown active={this.state.officeListOpen}>
              {this.state.officeListOpen &&
                <ul style={{listStyle: 'none'}}>
                  <li key='all' onClick={() => this.handleSelectedOffice('All Offices')}>All Offices</li>
                  {Object.entries(offices).map((parent, index) => {
                    return (
                      <div>
                        <li key={index} onClick={() => this.handleSelectedOffice(parent[0])}>
                          {parent[0]}
                        </li>
                        {parent[1].map((child, index) => {
                          return (
                            <li style={{paddingLeft:'20px'}} key={index} onClick={() => this.handleSelectedOffice(child)}>
                              {child}
                            </li>
                          )
                        })}
                      </div>
                    )
                  })}
                </ul>
              }
            </Dropdown>
          </DropdownContainer>
        </SpaceAroundContainer>
        <div>
          {Object.entries(departments).map((parent, index) => {
            return (
              <div className='jobListContainer'>
                <h3>{parent[0]}</h3>
                {parentJobs[parent[0]] 
                  ? parentJobs[parent[0]].map(job => {
                    return (
                      <div className='jobRow'>
                        {job[0]} | {job[1]} | {job[2]}
                      </div>
                    )
                  })
                  : null 
                }
                {parent[1].map(childName => {
                  return (
                    <div className='jobListContainer'>
                      <h3>{childName}</h3>
                      {childJobs[childName]
                        ? childJobs[childName].map(job => {
                          return (
                            <div className='jobRow'>
                              {job[0]} | {job[1]} | {job[2]}
                            </div>
                          )
                        })
                        : null 
                      }
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

const retrieveJobs = async () => {
  const res = await fetch('https://boards-api.greenhouse.io/v1/boards/databricks/departments');
  const data = await res.json();
  const parentJobsObject = {};
  const childJobsObject = {};

  data.departments.forEach(department => {
    if (department.id !== 0 && department.parent_id === null) {
      const jobs = [];
      department.jobs.forEach(job => {
        jobs.push([job.title, job.location.name, job.id]);
        parentJobsObject[department.name] = jobs;
      });
    } else {
      const jobs = [];
      department.jobs.forEach(job => {
        jobs.push([job.title, job.location.name, job.id]);
        childJobsObject[department.name] = jobs;
      });
    }
  });

  return [parentJobsObject, childJobsObject];

}

const retrieveDepartments = async () => {
  const res = await fetch('https://boards-api.greenhouse.io/v1/boards/databricks/departments');
  const data = await res.json();

  const departmentIdPairs = {};
  data.departments.forEach(department => {
    departmentIdPairs[department.id] = department.name;
  });

  const parentDepartments = {};
  data.departments.forEach(department => {
    const subDepartments = [];
    if (department.id !== 0 && department.parent_id === null && department.jobs.length > 0) {
      if (department.child_ids.length > 0) {
        department.child_ids.forEach(subDept => {
          if (departmentIdPairs[subDept]) {
            subDepartments.push(departmentIdPairs[subDept]);
          }
        });
      }
      parentDepartments[department.name] = subDepartments;
    }
  });
  
  return parentDepartments;
}

const retrieveOffices = async () => {
  const res = await fetch('https://boards-api.greenhouse.io/v1/boards/databricks/offices');
  const data = await res.json();

  const officeIdPairs = {};
  data.offices.forEach(office => {
    officeIdPairs[office.id] = office.name;
  });

  const officeJobsObject = {};
  data.offices.forEach(office => {
    const jobs = [];
    office.departments.forEach(department => {
      department.jobs.forEach(job => {
        jobs.push(job)
        officeJobsObject[office.name] = jobs;
      });
    });
  });

  const regions = {};
  data.offices.forEach(office => {
    const cities = [];
    if (office.id !== 0 && office.parent_id === null && office.child_ids.length > 0) {
      office.child_ids.forEach(subOffice => {
        if (officeIdPairs[subOffice] && officeJobsObject[officeIdPairs[subOffice]]) {
          cities.push(officeIdPairs[subOffice]);
        }
      });
      regions[office.name] = cities;
    }
  });

  return regions;
}