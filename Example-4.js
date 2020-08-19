import React, { Component } from 'react';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import BootstrapTable from 'react-bootstrap-table-next';
import AddIcon from '../../media/img/icons/permissions/add.png';
import EditIcon from '../../media/img/icons/permissions/edit.png';
import RemoveIcon from '../../media/img/icons/permissions/remove.png';
import Input from '../inputs/input';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import CustomScrollbars from "../CustomScrollbar";
import PulseLoader from "react-spinners/PulseLoader";
import { getTrackings, deleteTrackingById, addTracking, updateTracking} from '../../calls/trackmaintenance';
import animationData from '../../animations/successfulanimation.json';
import Lottie from 'react-lottie';

class TrackMaintenance extends Component {
    constructor(props) {
        super(props);

        this.state = {
            trackings: [],
            currentlySelected: null,
            showCreateModal: false,
            showEditModal: false,
            editObject: {},
            newTrackingObj: {name: "", active: true, comment: "", position: "100"},
            loading: true,
            isStopped: true, 
            isPaused: false,
            fixedlist: []
        }

        this.toggleModal = this.toggleModal.bind(this);
        this.getAndSetTrackings = this.getAndSetTrackings.bind(this);
        this.selectTracking = this.selectTracking.bind(this);
        this.updateField = this.updateField.bind(this);
        this.updateNewTrackingObj = this.updateNewTrackingObj.bind(this);
        this.deleteTable = this.deleteTracking.bind(this);
        this.updateEditField = this.updateEditField.bind(this);
        this.saveEditTrack = this.saveEditTrack.bind(this);
        this.updateFilterField = this.updateFilterField.bind(this);
        this.addTrackingItem = this.addTrackingItem.bind(this);
    }

    updateFilterField(e) {
        this.setState({
            configcomponentfilter: e.target.value
        }, () => {
            let fixedlist = [];
            this.state.trackings.map(item => {
                if (item.tableGroup === this.state.configcomponentfilter) {
                    fixedlist.push(item);
                }
            })

            this.setState({
                fixedlist: [...fixedlist]
            })
        })
    }

    saveEditTrack() {
        let editObject = this.state.editObject;

        updateTracking(editObject).then((response) => {
            console.log(response)
        }).then(() => {
            this.getAndSetTrackings();
            this.setState({
                showEditModal: false,
                isStopped: false
            })

            setTimeout(() => {
                this.setState({
                    isStopped: true
                })
            }, 3000)
        })
    }

    updateEditField(e, field, validated) {
        console.log(e.target.value)
        let copyEditObject = Object.assign({}, this.state.editObject);
        copyEditObject[field] = e.target.value;
        this.setState({
            editObject: copyEditObject
        }, () => {
        })

        if (validated !== undefined) {
            this.setState({
                validated: validated
            })
        }
    }

    deleteTracking() {
        if (this.state.currentlySelected !== null || this.state.currentlyselect !== undefined) {
            deleteTrackingById(this.state.trackings[this.state.currentlySelected].id).then((response) => {
                console.log(response)
            }).then(() => {
                this.getAndSetTrackings();
                this.setState({
                    isStopped: false
                })

                setTimeout(() => {
                    this.setState({
                        isStopped: true
                    })
                }, 3000)
            })
        }
    }

    addTrackingItem() {
        this.setState({
            showCreateModal: false
        })

        addTracking(this.state.newTrackingObj).then((response) => {
            console.log(response)
            this.getAndSetTrackings();
            this.setState({
                isStopped: false
            })
            setTimeout(() => {
                this.setState({
                    isStopped: true
                })
            }, 3000)
        })
    }

    updateField(e, field) {
        let copyState = Object.assign({}, this.state);
        copyState[field] = e.target.value;
        this.setState(copyState)
    }

    updateNewTrackingObj(data, type) {
        let copynewtracking = Object.assign({}, this.state.newTrackingObj);
        copynewtracking[type] = data.target.value;
        this.setState({
            newTrackingObj: copynewtracking
        })
    }

    getAndSetTrackings() {
        getTrackings().then((response) => {
            console.log(response.data.data.trackings.nodes)
            this.setState({
                trackings: [...response.data.data.trackings.nodes],
                loading: false
            })
        })
    }

    selectTracking(index) {
        this.setState({
            currentlySelected: index
        })
    }

    toggleModal(data) {
        if (data == "New") {
            this.setState({
                showCreateModal: !this.state.showCreateModal,
                configtypevalue: undefined
            })
        }

        if (data == "Delete") {
            this.deleteTracking();
        }

        if (data == "Edit") {
            if (this.state.currentlySelected !== null) {
                this.setState({
                    showEditModal: !this.state.showEditModal,
                    editObject: Object.assign({}, this.state.trackings[this.state.currentlySelected]),
                })
            }
        }
    }

    componentDidMount() {
        this.getAndSetTrackings();
    }

    render() {

        console.log(this.state);
        let controlitems = [
            {name: "New", icon: AddIcon, alt: "add"},
            {name: "Edit", icon: EditIcon, alt: "edit"},
            {name: "Delete", icon: RemoveIcon, alt: "remove"}
        ]

        const columns = [{
                dataField: 'name',
                text: 'Name',
                sort: true
            },
            {
                dataField: 'position',
                text: 'Order',
                sort: true
            },
            {
                dataField: 'active',
                text: 'Active',
                sort: true
            },
            {
                dataField: 'comments',
                text: 'Description',
                sort: true
            },
            {
                dataField: 'numberOfTrackingActives',
                text: '#Tables',
                sort: true
            },
            {
                dataField: 'trackingActives',
                text: 'String',
                sort: true
            }
        ];

        const selectRow = {
            mode: 'radio',
            clickToSelect: true,
            height: "200px",
            onSelect: (row, isSelect, rowIndex, e) => {
                let fixedIndex;
                this.state.trackings.map((item, index) => {
                    if (item.id == row.id) {
                        fixedIndex = index
                    }
                })
                this.selectTracking(fixedIndex);
            }
        };

       
        let data = [...this.state.trackings];

        if (this.state.fixedlist.length > 0) {
            data = [...this.state.fixedlist];
        }

        const defaultOptions = {
            loop: false,
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice'
            }
        };

        return(
            <>
            {
                this.state.loading && <PulseLoader
                css=""
                size={30}
                color={"#02113e"}
                loading={this.state.loading}
                />
            }
            {
                !this.state.loading &&
                <div className="groupswrap">
                    <div className="mastertitlewrap">
                        <div className="mastertab">
                            Rotation Maintenance
                        </div>
                    </div>
                    <div className={this.props.collapsedstate ? "controlswrap ctrlwrap_collapsed" : "controlswrap ctrlwrap_full"}>
                        {
                            controlitems.map(item => {
                                return <div className="controlitem" key={item.name} onClick={() => this.toggleModal(item.name)}>
                                            <img src={item.icon} alt={item.alt} />
                                            <div>{item.name}</div>
                                        </div>
                            })
                        }
                    </div>

                    {
                        !this.state.isStopped &&
                            <div className="lottiewrap">
                                <Lottie options={defaultOptions}
                                    height={400}
                                    width={400}
                                    isStopped={this.state.isStopped}
                                    isPaused={this.state.isPaused}
                                />
                            </div>
                    }

                    <CustomScrollbars autoHide className="gridcontainer" style={{ height: "calc(100vh - 230px)", width: "100%" }}>
                        <BootstrapTable
                            bootstrap4
                            keyField='id'
                            data={ data }
                            columns={ columns }
                            selectRow={ selectRow }
                            onClick={this.selected}
                            height="500px"
                        />
                    </CustomScrollbars>

                    {
                        this.state.showCreateModal &&
                        <div className="optionsmodal">
                            <div className="modalbox">
                                <div className="titlebar">
                                    <div>New Rotation</div>
                                    <div className="xbutton" onClick={() => this.toggleModal("New")}>×</div>
                                </div>
                                <div className="contentwrap">
                                    <div className="inputwrap" style={{paddingBottom: "0px"}}>
                                        <Input updateField={this.updateNewTrackingObj} width={"28ch"} fieldName={"name"} fieldDisplayName={"Name"} helpertext={"Enter name for track"}/>
                                        <Input updateField={this.updateNewTrackingObj} width={"30ch"} fieldName={"comment"} fieldDisplayName={"Comment"} helpertext={"Enter group name for new table station"}/>
                                    </div>
                                    <div className="inputwrap" style={{paddingBottom: "0px"}}>
                                    <Input updateField={this.updateNewTrackingObj} width={"10ch"} fieldName={"position"} fieldDisplayName={"Position"} helpertext={"Enter group name for new table station"}/>
                                    </div>
                                    <div className="inputwrap" style={{paddingBottom: "0px"}}>
                                        <Button variant="contained" color="secondary" onClick={() => this.toggleModal("New")}>
                                            Cancel
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={this.addTrackingItem}>
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {
                        this.state.showEditModal &&
                        <div className="optionsmodal">
                            <div className="modalbox">
                                <div className="titlebar">
                                    <div>Edit Rotation</div>
                                    <div className="xbutton" onClick={() => this.toggleModal("Edit")}>×</div>
                                </div>
                                <div className="contentwrap">
                                    <div className="inputwrap" style={{paddingBottom: "0px"}}>
                                            <Input updateField={this.updateEditField} width={"25ch"} newgroupname={this.state.editObject.name} groupname={this.state.trackings[this.state.currentlySelected].name} fieldName={"name"} fieldDisplayName={"Name"} helpertext={"Enter name for table station"}/>
                                            <Input updateField={this.updateEditField} width={"25ch"} newgroupname={this.state.editObject.active} groupname={this.state.trackings[this.state.currentlySelected].active} fieldName={"active"} fieldDisplayName={"Active"} helpertext={"Enter group name for table station"}/>
                                    </div>
                                    <div className="inputwrap" style={{paddingBottom: "0px"}}>
                                            <Input updateField={this.updateEditField} width={"57ch"} newgroupname={this.state.editObject.comments} groupname={this.state.trackings[this.state.currentlySelected].comments} fieldName={"comments"} fieldDisplayName={"Comments"} helpertext={"Enter group name for table station"}/>
                                    </div>
                                    <div className="inputwrap" style={{paddingTop: "20px", paddingBottom: "0px"}}>
                                        <Button variant="contained" color="secondary" onClick={() => this.toggleModal("Edit")}>
                                            Cancel
                                        </Button>
                                        <Button variant="contained" color="primary" onClick={this.saveEditTrack}>
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
            </>
        );
    }
}

const mapStateToProps = state => ({
    navigation: state.updateNavigation.nav,
    collapsedstate: state.updateCollapsed.collapsed
})

const mapDispatchToProps = dispatch => ({

})

export default connect(mapStateToProps, mapDispatchToProps)(TrackMaintenance);