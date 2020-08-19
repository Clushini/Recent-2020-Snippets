import React, { Component } from 'react';

import { Stage, Layer } from 'react-konva';
import { getDealers, getTracksByNavId, getSpecificTableDisplay, getTableDisplayById, trackingActiveByEmployeeId, getTableStationById, getGameGroupDetailsById, getTableDisplays, syncRotation, getTableLayoutById, getTrackingActives, getTrackingActivesById, syncTrackingActivesById, getTrackings, getAllTableDisplays, getAllTableStations } from '../../calls/index';
import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { connectmessage } from '../../constants/index';
import { v4 as uuidv4 } from 'uuid';
import { colourNameToHex, timeChecker, reorder, returnTimeFromIso, timeTranslatorToHM, grid, move, timeTranslator } from './utils.js';
import { closeTable, openTable, removeDealer, addDealer, sendTableMessage, sendAllTablesMessage } from './calls';

import Table from './table';
import animationData from '../../animations/successfulanimation.json';
import Lottie from 'react-lottie';
import DropDown from '../inputs/select';
import ReactResizeDetector from 'react-resize-detector';
import PulseLoader from "react-spinners/PulseLoader";
import BootstrapTable from 'react-bootstrap-table-next';
import CustomScrollbars from "../CustomScrollbar";
import ReactToPrint from 'react-to-print';
import SaveButton from '../../media/img/icons/permissions/save.png';
import RefreshButton from '../../media/img/icons/permissions/refresh.png';
import MessageTablesButton from '../../media/img/icons/permissions/messagetables.png';
import PrintButton from '../../media/img/icons/permissions/print.png';

import ColorButton from '../../media/img/icons/permissions/color.png';
import StatusButton from '../../media/img/icons/permissions/status.png';
import HideButton from '../../media/img/icons/permissions/hide.png';

import Button from '@material-ui/core/Button';

class DealerRotation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            canvaswidth2: 0,
            canvasheight2: 0,
            droppable1: [],
            droppable1id: "",
            droppable1name: "",
            droppable2: [],
            droppable2id: "",
            droppable2name: "",
            droppable3: [],
            droppable3id: "",
            droppable3name: "",
            droppable4: [],
            currentSelectedRotation: "droppable1",
            isStopped: true, 
            isPaused: false,
            messageTablesModal: false,
            dealerlist: [],
            dealerlistnames: [],
            currentlySelectedDealer: {},
            availableGames: [],
            currentlySelectedGame: {},
            gamelistnames: [],
            totalRotations: 0,
            currentView: "rotation",
            allTableMessage: "",
            showLayout: true,
            showPlayerModal: false,
            clickedPlayer: {},
            tablestatus: "tablegamecolor",
            showRotation: true,
            stageWidth: 100
        }

        this.createTable = this.createTable.bind(this);
        this.getList = this.getList.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.expandRotation = this.expandRotation.bind(this);
        this.getListStyle = this.getListStyle.bind(this);
        this.getOccupancyColor = this.getOccupancyColor.bind(this);
        this.addNewBreakToTableList = this.addNewBreakToTableList.bind(this);
        this.addNewCustomToTableList = this.addNewCustomToTableList.bind(this);
        this.setupNewTablesList = this.setupNewTablesList.bind(this);
        this.unlockCustom = this.unlockCustom.bind(this);
        this.updateSelectedCustominput = this.updateSelectedCustominput.bind(this);
        this.saveCustomInput = this.saveCustomInput.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.updateCurrentSelectedTable = this.updateCurrentSelectedTable.bind(this);
        this.saveRotations = this.saveRotations.bind(this);
        this.getAndSetRotations = this.getAndSetRotations.bind(this);
        this.returnTableDialogue = this.returnTableDialogue.bind(this);
        this.getAndSetDealers = this.getAndSetDealers.bind(this);
        this.updateEditField = this.updateEditField.bind(this);
        this.getAndSetAvailableGames = this.getAndSetAvailableGames.bind(this);
        this.sendCloseTable = this.sendCloseTable.bind(this);
        this.sendOpenTable = this.sendOpenTable.bind(this);
        this.updateTableFromTablePublish = this.updateTableFromTablePublish.bind(this);
        this.sendAddDealer = this.sendAddDealer.bind(this);
        this.sendRemoveDealer = this.sendRemoveDealer.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.sendMessageToTable = this.sendMessageToTable.bind(this);
        this.updateTableMessage = this.updateTableMessage.bind(this);
        this.sendMessageToAllTables = this.sendMessageToAllTables.bind(this);
        this.updateAllTablesMessage = this.updateAllTablesMessage.bind(this);
        this.hideLayout = this.hideLayout.bind(this);
        this.showLayout = this.showLayout.bind(this);
        this.setupLocationTimes = this.setupLocationTimes.bind(this);
        this.playerClicked = this.playerClicked.bind(this);
        this.addGuest = this.addGuest.bind(this);
        this.removePlayer = this.removePlayer.bind(this);
        this.toggleTableStatus = this.toggleTableStatus.bind(this);
        this.checkSize = this.checkSize.bind(this);
    }

    client = new W3CWebSocket(window.Configs.websocket);

    componentWillUnmount() {
        window.removeEventListener("resize", this.checkSize);
    }

    saveRotations() {
        this.rotation1 = [];
        this.rotation2 = [];
        this.rotation3 = [];
        for (let i = 1; i < this.state.totalRotations + 1; i++) {
            this.state[`droppable${i}`].map((item, index) => {
                if (item.tableData.typeCode == "Location" || item.tableData.tableStationId && item.tableData.tableStationId.length > 0) {
                    let tsid;
                    let tcode = "Location";
                    let mainid;
                    if (item.tableData.tableStationId && item.tableData.tableStationId.length > 0) {
                        tsid = item.tableData.tableStationId;
                        mainid = item.tableData.id;
                    }
                    else {
                        tsid = item.tableData.tableId;
                        mainid = item.tableData.activeId;
                    }
                    this[`rotation${i}`].push(
                        {
                            name: `${item.tableData.name}`,
                            trackingId: `${this.state[`droppable${i}id`]}`,
                            position: `${index + 1}`,
                            tableStationId: `${tsid}`,
                            typeCode: `${tcode}`
                        }
                    )
                }
    
                if (item.tableData.typeCode == "Break" || item.tableData.typeCode == "Custom") {
                    this[`rotation${i}`].push(
                        {
                            name: `${item.tableData.gameName}`,
                            trackingId: `${this.state[`droppable${i}id`]}`,
                            position: `${index + 1}`,
                            typeCode: `${item.tableData.typeCode}`
                        }
                    )
                }
            })
        }

        let jsonrotation1 = JSON.stringify(this.rotation1);
        let fixedjsonrotation1 = jsonrotation1.replace(/"(\w+)"\s*:/g, '$1:');

        let jsonrotation2 = JSON.stringify(this.rotation2);
        let fixedjsonrotation2 = jsonrotation2.replace(/"(\w+)"\s*:/g, '$1:');

        let jsonrotation3 = JSON.stringify(this.rotation3);
        let fixedjsonrotation3 = jsonrotation3.replace(/"(\w+)"\s*:/g, '$1:');

        this.setState({
            loading: true
        })
        syncRotation(this.state.droppable1id, fixedjsonrotation1).then((response) => {
        }).then(() => {
            if (this.state.droppable2id) {
                syncRotation(this.state.droppable2id, fixedjsonrotation2).then((response) => {
                }).then(() => {
                    if (this.state.droppable3id) {
                        syncRotation(this.state.droppable3id, fixedjsonrotation3).then((response) => {
                        }).then(() => this.getAndSetRotations())
                    }
                    else {
                        this.getAndSetRotations();
                    }
                })
            }
            else {
                this.getAndSetRotations();
            }
        })
    }

    id2List = {
        droppable1: 'droppable1',
        droppable2: 'droppable2',
        droppable3: 'droppable3',
        droppable4: 'droppable4'
    };

    getListStyle = (isDraggingOver, type, droppable) => {
        let width = 120;
        if (droppable && droppable == this.state.currentSelectedRotation) {
            width = 520
        }
        if (type == "tables") {
            width = 120;
        }
        return {
            background: isDraggingOver ? 'lightblue' : '#F4F5F7',
            padding: grid,
            width: width,
            height: "calc(100% - 50px)",
            marginRight: 10,
            borderRadius: "0px 0px 4px 4px",
            WebkitTransition: 'all', // note the capital 'W' here
            msTransition: 'all', // 'ms' is the only lowercase vendor prefix
            backgroundColor: "#F4F5F7",
            overflowY: "scroll",
            overflowX: "none"
        }
    }

    getList = id => this.state[this.id2List[id]];

    expandRotation(droppable) {
        this.setState({
            currentSelectedRotation: droppable
        })
    }

    onDragEnd(result) {
        const { source, destination } = result;

        let fixBreak = () => {
            let copyTables = [...this.state.droppable4];
            let filtered = copyTables.filter((element) => {
                return element.name !== "BRK";
            })
            let cstfiltered = filtered.filter((element) => {
                return element.name !== "CST";
            })
            
            this.setState({
                droppable4: cstfiltered
            }, () => {
                this.setupNewTablesList();
            })
        }

        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const rotation = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let copyState = Object.assign({}, this.state)
            copyState[source.droppableId] = rotation;
            this.setState(copyState, () => {
                fixBreak()
            })
        } else {
            const result = move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination,
                this.state.tables
            );

            this.setState(result, () => {
                fixBreak()
            })
        }
    };
    
    getAndSetAvailableGames() {
        let ggid;
        this.props.navigation.map(item => {
            if (item.showSubmenu) {
                item.subItems.map(subitem => {
                    if (subitem.active) {
                        ggid = subitem.gameGroupId;
                    }
                })
            }
        });

        if (ggid) {
            getGameGroupDetailsById(ggid).then((response) => {
                this.setState({
                    availableGames: [...response.data.data.gameGroupDetails.nodes]
                }, () => {
                    let gamenames = [];
                    this.state.availableGames.map(item => {
                        gamenames.push(item.gameName);
                    })
                    this.setState({
                        gamelistnames: [...gamenames]
                    })
                })
            })
        }
    }

    getAndSetRotations() {
        getTableLayoutById(this.props.layoutid).then((response) => {
            this.setState({
                loading: true,
                tableLayout: response.data.data.tableLayout
            }, () => {

                let finalx = 0;
                let finaly = 0;
                let smallx = 0;
                let smally = 0;

                this.state.tableLayout.Displays.map(item => {
                    if (item.locationRight > finalx) {
                        finalx = item.locationRight;
                    }
                    if (item.locationTop > finaly) {
                        finaly = item.locationTop;
                    }
                })

                smallx = finalx;
                smally = finaly;

                this.state.tableLayout.Displays.map(item => {
                    if (item.locationRight < smallx) {
                        smallx = item.locationRight;
                    }
                    if (item.locationTop < smally) {
                        smally = item.locationTop;
                    }
                })

                this.setState({
                    canvaswidth2: finalx - smallx + 50,
                    canvasheight2: finaly - smally + 50
                })

                this.setState({
                    tables: [...this.state.tableLayout.Displays]
                })

            })
        }).then(() => {
            getTrackings().then((response) => {
            })
        }).then(() => {
            getAllTableStations().then((response) => {
                let copyResponse = [...response.data.data.tableStations.nodes];
                copyResponse = copyResponse.filter((item) => {
                    return item.name !== ""
                })
                this.setState({
                    allTableDisplays: [...copyResponse]
                }, () => {
                    getTrackingActives().then((response) => {
                        let copyResponseNodes = [...response.data.data.trackingActives.nodes];
                        let copyAllTableDisplays = [...this.state.allTableDisplays];
                        copyResponseNodes.map((trackingactive) => {
                            copyAllTableDisplays.map((display, index) => {
                                if (trackingactive.name == display.name) {
                                    copyAllTableDisplays[index].tableData = trackingactive
                                }
                            })
                        })

                        copyResponseNodes.map((trackingactive) => {
                            if (trackingactive.typeCode == "Break") {
                                copyAllTableDisplays.unshift({id: uuidv4(), name: "BRK", tableData: {position: `${trackingactive.position}`, activeId: `${trackingactive.activeId}`, trackId: `${trackingactive.trackId}`, gameName: `${trackingactive.name}`, typeCode: "Break"}})
                            }
                            if (trackingactive.typeCode == "Custom") {
                                copyAllTableDisplays.unshift({id: uuidv4(), name: "CST", tableData: {position: `${trackingactive.position}`, activeId: `${trackingactive.activeId}`, trackId: `${trackingactive.trackId}`, gameName: `${trackingactive.name}`, typeCode: "Custom"}})
                            }
                        })

                        this.setState({
                            allTableDisplays: copyAllTableDisplays
                        }, () => {

                            let rotation1 = [];
                            let rotation2 = [];
                            let rotation3 = [];

                            this.state.allTableDisplays.map(item => {
                                if (item.tableData && item.tableData.trackId == this.state.droppable1id) {
                                    rotation1.push(item);
                                }
                                if (item.tableData && item.tableData.trackId == this.state.droppable2id) {
                                    rotation2.push(item);
                                }
                                if (item.tableData && item.tableData.trackId == this.state.droppable3id) {
                                    rotation3.push(item);
                                }
                            })

                            this.setState({
                                droppable1: [...rotation1],
                                droppable2: [...rotation2],
                                droppable3: [...rotation3]
                            }, () => {
                                let copyTables = [...this.state.tables]

                                getTableDisplays(this.state.tableLayout.id).then((response) => {
                                    response.data.data.tableDisplays.nodes.map(item => {
                                        copyTables.map((table, index) => {
                                            if (item.name == table.name) {
                                                copyTables[index].tableData = item
                                            }
                                        })
                                    })
                                    
                                    this.setState({
                                        tables: copyTables
                                    }, () => {
                                        let reducedtables = [];
                                        this.state.tables.map((table) => {
                                            this.state.allTableDisplays.map(td => {
                                                if (table.name == td.name) {
                                                    let copyTd = Object.assign({}, td);
                                                    copyTd.tableData = table.tableData;
                                                    reducedtables.push(copyTd);
                                                }
                                            })
                                        })

                                        reducedtables.map((table, index) => {
                                            this.state.droppable1.map(table2 => {
                                                if (table.name == table2.name) {
                                                    reducedtables[index].deleteme = true;
                                                }
                                            })
                                        })

                                        reducedtables.map((table, index) => {
                                            this.state.droppable2.map(table2 => {
                                                if (table.name == table2.name) {
                                                    reducedtables[index].deleteme = true;
                                                }
                                            })
                                        })

                                        reducedtables.map((table, index) => {
                                            this.state.droppable3.map(table2 => {
                                                if (table.name == table2.name) {
                                                    reducedtables[index].deleteme = true;
                                                }
                                            })
                                        })

                                        let filteredtables = reducedtables.filter((item) => {
                                            return item.deleteme !== true
                                        })

                                        this.setState({
                                            droppable4: [...filteredtables]
                                        }, () => {
                                            let copyState = Object.assign({}, this.state);
                                            copyState.droppable4.sort((a, b) => Number(a.tableData.position) > Number(b.tableData.position) ? 1 : -1);
                                            copyState.droppable2.sort((a, b) => Number(a.tableData.position) > Number(b.tableData.position) ? 1 : -1);
                                            copyState.droppable1.sort((a, b) => Number(a.tableData.position) > Number(b.tableData.position) ? 1 : -1);
                                            copyState.droppable3.sort((a, b) => Number(a.tableData.position) > Number(b.tableData.position) ? 1 : -1);
                                            copyState.loading = false;
                                            this.setState(copyState, () => {
                                                setTimeout(() => {
                                                    this.setupNewTablesList();
                                                    this.refreshTableWithActiveDealer();
                                                }, 10)
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    }

    getAndSetDealers() {
        getDealers().then((response) => {
            let res = [...response.data.data.employees.nodes];
            res.map(item => {
                item.name = `${item.firstName} ${item.lastName}`
            })
            this.setState({
                dealerlist: [...res]
            }, () => {
                let dlistnames = [];

                this.state.dealerlist.map(item => {
                    let dname;
                    dname = `${item.firstName} ${item.lastName}`;
                    dlistnames.push(dname);
                })

                let sorted = dlistnames.sort();

                this.setState({
                    dealerlistnames: [...sorted]
                })
            })
        }).then(() => {
            this.refreshTableWithActiveDealer();
        })
    }

    componentDidMount() {
        this.getAndSetRotations();
        this.getAndSetDealers();
        this.getAndSetAvailableGames();

        let test = new Date();

        getTracksByNavId(this.props.id).then((response) => {
            let activeTracks = [];
            response.data.data.trackings.nodes.map(track => {
                if (track.active) {
                    activeTracks.push(track)
                }
            })
            let sortedActiveTracks = activeTracks.sort((a, b) => (a.position > b.position) ? 1 : -1);
            let copyState = Object.assign({}, this.state);
            for (let i = 1; i < sortedActiveTracks.length + 1; i++) {
                copyState[`droppable${i}id`] = sortedActiveTracks[i - 1].id;
                copyState[`droppable${i}name`] = sortedActiveTracks[i - 1].name;
            }
            copyState.totalRotations = sortedActiveTracks.length;
            this.setState(copyState)
        })

        this.client.onopen = () => {
            this.client.send(JSON.stringify(connectmessage));
            this.client.send(JSON.stringify({"Msg_Type":"Ping"}))
        };

        this.client.onclose = () => {
            console.log('Closed Websocket Connection');
        };

        this.client.onmessage = (e) => {
            let res = JSON.parse(e.data);
            console.log(res)
            if (res["Msg_Type"] == "TablePublish") {
                if (res["Msg_Action"] == "TableUpdate") {
                    let stationId = res.StationId.replace(/-/g, "");
                    this.updateTableFromTablePublish(stationId);
                }
            }
        };

        this.checkSize();
        window.addEventListener("resize", this.checkSize);
    }

    updateTableFromTablePublish(stationId) {

        getSpecificTableDisplay(this.state.tableLayout.id, stationId).then((response) => {
            console.log(response)
            let node = response.data.data.tableDisplays.nodes[0];
            
            let copyTableLayout = Object.assign({}, this.state.tableLayout);
            copyTableLayout.Displays.map((display, index) => {
                if (display && node && (display.tableStationId == node.tableStationId)) {
                    copyTableLayout.Displays[index].tableData = node; 
                }
            })

            this.setState({
                tableLayout: copyTableLayout
            })
        }, () => {
            getTableStationById(stationId).then((response) => {
                console.log(response)
                let copyState = Object.assign({}, this.state);
    
                getTableDisplays(this.props.layoutid).then((response2) => {
                    let tabledisplaynodes = response2.data.data.tableDisplays.nodes;
                    let tabledata;
    
                    tabledisplaynodes.map(td => {
                        if (td.tableStationId == stationId) {
                            tabledata = td;
                        }
                    })
    
                    for (let i = 1; i < this.state.totalRotations + 1; i++) {
                        copyState[`droppable${i}`].map((item, index) => {
                            if (item.tableData && (item.tableData.tableId == stationId || item.tableData.tableStationId == stationId)) {
                                let stationinfo = item;
                                stationinfo.tableData = tabledata;
                                copyState[`droppable${i}`].splice(index, 1, stationinfo);
                            }
                        })
                    }
    
                    copyState.droppable4.map((item, index) => {
                        if (item.tableData && (item.tableData.tableId == stationId || item.tableData.tableStationId == stationId)) {
                            let stationinfo = item;
                            stationinfo.tableData = tabledata;
                            copyState.droppable4.splice(index, 1, stationinfo);
                        }
                    })
    
                    copyState.tables.map((table, index) => {
                        if (table.tableStationId == stationId) {
                            copyState.tables[index].tableData = tabledata;
                        }
                    })
    
                    this.setState(copyState, () => {
                        this.refreshTableWithActiveDealer();
                    });
                })
            })
        })
    }

    refreshTableWithActiveDealer() {
        let setTimes = () => {
            let copyState = Object.assign({}, this.state);

            [...Array(this.state.totalRotations)].map((num, index) => {
                let i = index + 1;
                let copyDroppable = [...copyState[`droppable${i}`]];
    
                copyDroppable.map((table, index) => {
                    if (table.tableData && table.tableData.employeeId && (table.tableData.active || table.tableData.activeId)) {
                        trackingActiveByEmployeeId(table.tableData.employeeId).then((response) => {
                            if (response.data && response.data.data && response.data.data.trackingActives) {
                                table.tableData = response.data.data.trackingActives.nodes[0];
                            }
                            if (table.tableData && table.tableData.timeAtLocation) {
                                table.tableData.fixedTime = timeTranslator(table.tableData.timeAtLocation, table.tableData);
                            }
                            if (table.tableData && table.tableData.employeeTimeAtLocation) {
                                table.tableData.fixedTime = timeTranslator(table.tableData.employeeTimeAtLocation, table.tableData);
                            }
                        }).then(() => {
                            this.setState(copyState)
                        })
                    }
                    if (table.tableData && !table.tableData.active && table.tableData.employeeId && table.tableData.id) {
                        getTableDisplayById(table.tableData.id).then((response) => {
                            table.tableData = response.data.data.tableDisplays.nodes[0];
                            table.tableData.fixedTime = timeTranslator(table.tableData.employeeTimeAtLocation, table.tableData);
                        })
                    }
                })
            })

            let copyDroppable4 = [...copyState.droppable4];

            copyDroppable4.map((table, index) => {
                if (table.tableData && table.tableData.employeeId && (table.tableData.active || table.tableData.activeId)) {
                    trackingActiveByEmployeeId(table.tableData.employeeId).then((response) => {
                        table.tableData = response.data.data.trackingActives.nodes[0];
                        if (table.tableData && table.tableData.timeAtLocation) {
                            table.tableData.fixedTime = timeTranslator(table.tableData.timeAtLocation, table.tableData);
                        }
                        if (table.tableData && table.tableData.employeeTimeAtLocation) {
                            table.tableData.fixedTime = timeTranslator(table.tableData.employeeTimeAtLocation, table.tableData);
                        }
                    }).then(() => {
                        this.setState(copyState)
                    })
                }
                if (table.tableData && !table.tableData.active && table.tableData.employeeId) {
                    getTableDisplayById(table.tableData.id).then((response) => {
                        if (response.data.data && response.data.data.tableDisplays) {
                            table.tableData = response.data.data.tableDisplays.nodes[0];
                        }
                        table.tableData.fixedTime = timeTranslator(table.tableData.employeeTimeAtLocation, table.tableData);
                    })
                }
            })
        }

        setTimes();
        let interval_id = window.setInterval("", 9999);
        for (let i = 1; i < interval_id; i++) {
            window.clearInterval(i);
        }
        setInterval(setTimes, 40000);
    }

    setupLocationTimes() {
        
        let setDealerTimes = () => {
            let copyState = Object.assign({}, this.state);

            [...Array(this.state.totalRotations)].map((num, index) => {
                let i = index + 1;
                let copyDroppable = [...copyState[`droppable${i}`]];
                copyDroppable.map((table, index) => {
                    if (table.tableData.employeeFirstName) {
                        if (table.tableData.employeeTimeAtLocation) {
                            table.tableData.fixedTime = timeTranslator(table.tableData.employeeTimeAtLocation, table.tableData);
                        }
                        if (table.tableData.timeAtLocation) {
                            table.tableData.fixedTime = timeTranslator(table.tableData.timeAtLocation, table.tableData);
                        }
                    }
                })
            })
    
            this.setState(copyState);
        }

        setDealerTimes();
        clearInterval(setDealerTimes);
        this.refreshTableWithActiveDealer();
    }

    setupNewTablesList() {
        let copyTables = [...this.state.droppable4];
        copyTables.sort((a, b) => (a.name > b.name) ? 1 : -1);
        copyTables.unshift({id: uuidv4(), name: "CST", tableData: {gameName: "CUSTOM", typeCode: "Custom"}});
        copyTables.unshift({id: uuidv4(), name: "BRK", tableData: {gameName: "BREAK", typeCode: "Break"}});
        this.setState({
            droppable4: copyTables
        })
    }

    addNewCustomToTableList() {
        let copyTables = [...this.state.droppable4];
        copyTables.unshift({id: uuidv4(), name: "CST", tableData: {gameName: "CUSTOM", typeCode: "Custom"}});
        this.setState({
            droppable4: copyTables
        })
    }

    addNewBreakToTableList() {
        let copyTables = [...this.state.droppable4];
        copyTables.unshift({id: uuidv4(), name: "BRK", tableData: {gameName: "BREAK", typeCode: "Break"}});
        this.setState({
            droppable4: copyTables
        })
    }

    updateCurrentSelectedTable(id, name) {
        this.setState({
            currentSelectedId: id,
            currentSelectedName: name
        })
    }

    createTable = (item, index) => {
        let itemx = (item.locationRight) ? item.locationRight : 10;
        let itemy = (item.locationTop) ? item.locationTop : 10;
        let rotation = (item.rotation) ? item.rotation : 0;
        let rgb = (item.rgb) ? item.rgb : {red: 221, green: 221, blue: 221};

        let occupancycolor;

        if (item.tableData) {
            let activeplayers = item.tableData.playersSeated;
            let maxplayers = item.tableData.maxPlayers;
    
            let occupancypercent = activeplayers / maxplayers * 100;

            if (item.tableData.maxPlayers) {
                if (occupancypercent > 32 || occupancycolor < 33 || !occupancycolor) {
                    occupancycolor = "red";
                } 

                if (occupancypercent > 50) {
                    occupancycolor = "yellow";
                }

                if (occupancypercent > 80) {
                    occupancycolor = "limegreen";
                }
            }
        }

        let rgboccupancy = (occupancycolor) ? colourNameToHex(occupancycolor) : colourNameToHex("lightgrey");
    
        if (item.tableData) {
            return(
                <Table tablestatus={this.state.tablestatus} occupancycolor={rgboccupancy} showType={this.state.tablestatus} playerClicked={this.playerClicked} rgb={(this.state.tablestatus == "tablegamecolor") ? rgb : rgboccupancy} item={item.tableData} updateCurrentSelectedTable={this.updateCurrentSelectedTable} deselectItem={this.deselectItem} selectTable={this.selectTable} selectedTable={this.state.currentSelectedId} name={item.name} id={item.id} src={item.picture} x={itemx} y={itemy} rotation={rotation} index={index}/>
            );
        }
    }

    getOccupancyColor(item) {
        if (item.tableData) {
            // let maxplayers = item.tableData.maxPlayers;
            // let seated = item.tableData.seatedPlayers;
            // if (item.tableData.playersSeated > -1) {
            //     seated = item.tableData.playersSeated
            // }
            // let result = maxplayers - seated;
    
            // let color;

            let occupancycolor;

            let activeplayers = item.tableData.playersSeated;
            let maxplayers = item.tableData.maxPlayers;
    
            let occupancypercent = activeplayers / maxplayers * 100;

            if (item.tableData.maxPlayers) {
                if (occupancypercent > 32 || occupancycolor < 33 || !occupancycolor) {
                    occupancycolor = "red";
                } 

                if (occupancypercent > 50) {
                    occupancycolor = "yellow";
                }

                if (occupancypercent > 80) {
                    occupancycolor = "green";
                }
            }

            switch(true) {
                case (item.name == "BRK"): {
                    occupancycolor = "blackout";
                    break;
                }
                
                case (item.name == "CST"): {
                    occupancycolor = "greyout";
                    break;
                }
            }
    
            return `${occupancycolor}`
        }
    }

    unlockCustom(item) {
        this.setState({
            currentSelectedCustom: item.id
        })
    }

    updateSelectedCustominput(e) {
        this.setState({
            currentSelectedCustomInput: e.target.value
        })
    }

    saveCustomInput(item, index, location) {
        let copyItem = Object.assign({}, item);
        copyItem.tableData.gameName = this.state.currentSelectedCustomInput;
        if (this.state.currentSelectedCustomInput == null) {
            copyItem.tableData.gameName = "CUSTOM"
        }

        let copyState = Object.assign({}, this.state);
        copyState[location][index] = copyItem;
        copyState.currentSelectedCustomInput = null;
        copyState.currentSelectedCustom = null;

        this.setState(copyState);
    }

    toggleModal(data) {
        if (data == "Save") {
            this.saveRotations();
        }

        if (data == "Refresh") {
            this.getAndSetRotations();
        }

        if (data == "Message Tables") {
            this.setState({
                messageTablesModal: true
            })
        }
        
        if (data == "Hide Rotation") {
            this.setState({
                showRotation: !this.state.showRotation
            })
        }
    }

    updateEditField(e, type) {
        let value = e.target.value;

        if (type == "dealerselect") {
            this.state.dealerlist.map(item => {
                if (item.name == value) {
                    this.setState({
                        currentlySelectedDealer: item
                    })
                }
            })
        }

        if (type == "gameselect") {
            this.state.availableGames.map(item => {
                if (item.gameName == value) {
                    this.setState({
                        currentlySelectedGame: item
                    })
                }
            })
        }
    }

    returnTableDialogue() {
        let copyItem;
        let copyItemIndex;
        if (this.state.tables) {
            this.state.tables.map((item, index) => {
                if (item.id == this.state.currentSelectedId) {
                    copyItem = Object.assign({}, item);
                    copyItemIndex = index;
                }
            })
        }

        if (copyItem && copyItem.tableData) {
            let fontcolor = copyItem.tableData.gameColor;
            return  <div className="tabledialogue">
                        <div className="titlebar">
                            <div className="name">Table {copyItem.name}</div>
                            <div className="xbutton" onClick={() => this.setState({currentSelectedId: null})}>×</div>
                        </div>
                        <div className="miniwrap">
                            {
                                copyItem.tableData.gameId ?
                                    <>
                                        <div className="gamename" style={{color: fontcolor}}>{copyItem.tableData.gameName}</div>
                                        <div className="timearea">Open: {returnTimeFromIso(copyItem.tableData.timeOpen)} <b></b></div>
                                    </>
                                    :
                                    <DropDown updateField={this.updateEditField} value={this.state.currentlySelectedGame.gameName} width={"25ch"} items={this.state.gamelistnames} fieldName={"gameselect"} fieldDisplayName={"Choose Game"} helpertext={"Choose a value"}/>

                            }
                            {
                                copyItem.tableData.gameId ? <div className="button closebtn" onClick={() => this.sendCloseTable(copyItem)}>Close Table</div> : <div className="button openbtn" onClick={() => this.sendOpenTable(copyItem)}>Open Table</div>
                            }
                        </div>
                        <div className="miniwrap">
                            <div className="gamename">
                                {
                                    (copyItem.tableData.employeeId) ? 

                                    <>
                                        <div className="dealertime">
                                            <strong>Dealer:</strong> {returnTimeFromIso(copyItem.tableData.employeeStartTime)}<a> ({timeTranslatorToHM(copyItem.tableData.employeeTimeAtLocation, copyItem.tableData)})</a>
                                        </div>
                                        <div className="dealername">
                                            <div>{`${copyItem.tableData.employeeFirstName} ${copyItem.tableData.employeeLastName}`}</div>
                                            <div>{copyItem.tableData && copyItem.tableData.employeeNumber}</div>
                                        </div>
                                    </>

                                    : 
                                    
                                    "NO DEALER"
                                }
                            </div>
                                {(!copyItem.tableData.employeeId) && <DropDown updateField={this.updateEditField} value={this.state.currentlySelectedDealer.name} width={"25ch"} items={this.state.dealerlistnames} fieldName={"dealerselect"} fieldDisplayName={"Choose Dealer"} helpertext={"Choose a value"}/>}
                            <div className={(copyItem.tableData.employeeId) ? "button closebtn" : "button"} onClick={(copyItem.tableData.employeeId) ? () => this.sendRemoveDealer(copyItem) : () => this.sendAddDealer(copyItem)}>{(copyItem.tableData.employeeId) ? "Remove Dealer" : "Add Dealer"}</div>
                        </div>
                        <div className="messagearea">
                            <textarea placeholder="Send Message" value={copyItem.messageValue} onChange={(e) => this.updateTableMessage(copyItem, copyItemIndex, e)}></textarea>
                            <div className="button" onClick={() => this.sendMessageToTable(copyItem, copyItemIndex)}>Send</div>
                        </div>
                    </div>
        }
    }

    sendCloseTable(item) {
        this.client.send(closeTable(item.tableData.tableStationId, item.tableData.gameId));
    }

    sendOpenTable(item) {
        if (this.state.currentlySelectedGame.gameId) {
            this.client.send(openTable(item.tableData.tableStationId, this.state.currentlySelectedGame.gameId));
        }
    }

    sendRemoveDealer(item) {
        this.client.send(removeDealer(item.tableData.tableStationId));
    }

    sendAddDealer(item) {        
        this.client.send(addDealer(item.tableData.tableStationId, this.state.currentlySelectedDealer.id));
    }

    resizeCanvas(width, height) {
        this.setState({
            canvaswrapwidth: width,
            canvaswrapheight: height
        })
    }
    
    sendMessageToTable(item, index) {
        if (item.messageValue.length > 0) {
            this.client.send(sendTableMessage(item.tableData.tableStationId, item.messageValue));

            let copyTables = [...this.state.tables];
            copyTables[index].messageValue = "";
            this.setState({
                tables: copyTables,
                isStopped: false
            }, () => {
                setTimeout(() => {
                    this.setState({
                        isStopped: true
                    })
                }, 3000)
            })
        }
    }

    sendMessageToAllTables() {
        if (this.state.allTableMessage.length > 0) {
            this.client.send(sendAllTablesMessage(this.state.allTableMessage));
            this.setState({
                allTableMessage: "",
                isStopped: false,
                messageTablesModal: false
            }, () => {
                setTimeout(() => {
                    this.setState({
                        isStopped: true
                    })
                }, 3000)
            })
        }
    }

    updateTableMessage(item, index, e) {
        let value = e.target.value;
        let copyItem = Object.assign({}, item);
        copyItem.messageValue = value;

        let copyTables = [...this.state.tables];
        copyTables[index] = copyItem;
        this.setState({
            tables: copyTables
        })
    }

    updateAllTablesMessage(e) {
        let value = e.target.value;

        this.setState({
            allTableMessage: value
        })
    }

    hideLayout() {
        this.setState({
            showLayout: false
        })
    }

    showLayout() {
        this.setState({
            showLayout: true
        })
    }

    playerClicked(seatInfo, seatnum, tableStationId) {

        if (seatInfo) {
            this.setState({
                clickedPlayer: seatInfo,
                clickedPlayerSeatNum: seatnum,
                clickedTableStationId: tableStationId,
                showPlayerModal: true
            })
        }

        else {
            this.setState({
                clickedPlayer: false,
                clickedPlayerSeatNum: seatnum,
                clickedTableStationId: tableStationId,
                showPlayerModal: true
            })
        }

    }

    addGuest() {
        this.setState({
            showPlayerModal: false
        })
        let addGuestMessage = `
            {
                "Msg_Type": "Seated",
                "Msg_Action": "AddPlayer",
                "Msg_SourceId": "8b3f8405-e95d-4410-a048-74a963a9bb04",
                "Msg_Created": "2020-07-27T19:50Z",
                "ClientId": "8b3f8405-e95d-4410-a048-74a963a9bb04",
                "TransactionId": "12a6d59e-5135-4c1d-9acb-fcceb19938fc",
                "Msg_ObjectId": "${this.state.clickedTableStationId}",
                "Msg_Parameter": "${this.state.clickedPlayerSeatNum}",
                "Msg_Client": "WebClient",
                "Msg_UserId": "null",
                "Msg_UserLogin": "null"
            }
        `;

        this.client.send(addGuestMessage)
    }

    removePlayer() {
        this.setState({
            showPlayerModal: false
        })
        let removePlayerMessage = `
            {
                "Msg_Type": "Seated",
                "Msg_Action": "RemovePlayer",
                "Msg_SourceId": "8b3f8405-e95d-4410-a048-74a963a9bb04",
                "Msg_Created": "2020-07-27T19:52Z",
                "ClientId": "8b3f8405-e95d-4410-a048-74a963a9bb04",
                "TransactionId": "62265767-3270-462c-befa-6b805a234db8",
                "Msg_ObjectId": "${this.state.clickedTableStationId}",
                "Msg_ActionId": "${this.state.clickedPlayer.id}",
                "Msg_Client": "WebClient",
                "Msg_UserId": "null",
                "Msg_UserLogin": "null"
            }
        `;

        this.client.send(removePlayerMessage)
    }
    
    toggleTableStatus(alt) {
        this.setState({
            tablestatus: alt
        })
    }

    checkSize = () => {
        const width = this.container.offsetWidth;
        this.setState({
            stageWidth: width
        });
    };

    render() {    
        const controlitems = [
            {name: "Save", alt: "savecurrent", img: SaveButton},
            {name: "Refresh", alt: "refresh", img: RefreshButton},
            {name: "Print", alt: "msg1", img: PrintButton},
            {name: "Message Tables", alt: "msgtables", img: MessageTablesButton},
            {name: "Hide Rotation", alt: "hiderotation", img: HideButton}
        ]

        const tablecontrolitems = [
            {name: "Game Color", alt: "tablegamecolor", img: ColorButton},
            {name: "Occupancy", alt: "tableoccupancy", img: StatusButton}
        ]

        const tabs = [
            {name: "Dealer Rotation", alt: "rotation"},
            {name: "Grid View", alt: "grid"}
        ]

        const defaultOptions = {
            loop: false,
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice'
            }
        };

        const columns = [{
            dataField: 'name',
            text: 'Location',
            sort: true,
            headerStyle: (colum, colIndex) => {
                return { width: '90px', textAlign: 'center' };
            }
        },
        {
            dataField: 'gamename',
            text: 'Game',
            sort: true,
            headerStyle: (colum, colIndex) => {
                return { width: '140px', textAlign: 'center' };
            }
        },
        {
            dataField: 'dealer',
            text: 'Employee',
            sort: true,
            headerStyle: (colum, colIndex) => {
                return { width: '180px', textAlign: 'center' };
            }
        },
        {
            dataField: 'employeenumber',
            text: '#',
            sort: true,
            headerStyle: (colum, colIndex) => {
                return { width: '60px', textAlign: 'center' };
            }
        },
        {
            dataField: 'start',
            text: 'Start',
            sort: true,
            headerStyle: (colum, colIndex) => {
                return { width: '90px', textAlign: 'center' };
            }
        },
        {
            dataField: 'time',
            text: 'Time',
            sort: true,
            headerStyle: (colum, colIndex) => {
                return { width: '90px', textAlign: 'center' };
            }
        },
        {
            dataField: 'notes',
            text: 'Notes',
            sort: true
        }
        ];

        const selectRow = {
            mode: 'radio',
            clickToSelect: true,
            height: "200px",
            hideSelectColumn: true,
            onSelect: (row, isSelect, rowIndex, e) => {
            }
        };

        let data = {};

        [...Array(this.state.totalRotations)].map((num, index) => {
            let i = index + 1;

            let droppabledata = [];
            let copyDroppable = [...this.state[`droppable${i}`]]
            copyDroppable.map(item => {
                let itempkg = {};
                itempkg.name = (item.tableData && item.tableData.name) ? item.tableData.name : item.name;
                itempkg.gamename = (item.tableData) ? item.tableData.gameName : ""
                itempkg.dealer = (item.tableData && item.tableData.employeeFirstName) ? item.tableData.employeeFirstName + " " + item.tableData.employeeLastName : "";
                itempkg.time = (item.tableData && item.tableData.fixedTime) ? item.tableData.fixedTime : "";
                itempkg.employeenumber = (item.tableData && item.tableData.employeeNumber) ? item.tableData.employeeNumber : "";
                itempkg.start = "";
                itempkg.notes = "";
                itempkg.id = uuidv4();

                droppabledata.push(itempkg);
            })
            
            data[`droppable${i}`] = [...droppabledata];
        })

        const rowClasses = (row, rowIndex) => {
            let classes = "custom-row-class";
          
            if (row.name == "BRK") {
              classes = 'custom-row-class isbreak';
            }
            
            if (row.name == "CST") {
                classes = 'custom-row-class iscustom';
            }

            if (row.dealer.length > 0) {
                let timeresult = timeChecker(row.time);
                if (timeresult) {
                    classes = 'custom-row-class dealeralive darkred';
                }
                else {
                    classes = 'custom-row-class dealeralive';
                }
            }
          
            return classes;
        };

        let fixedDisplays = (this.state.tableLayout) ? [...this.state.tableLayout.Displays] : [];

        fixedDisplays.map(display => {
            if (display.tableData && display.tableData.gameColor) {
                display.rgb = colourNameToHex(display.tableData.gameColor);
            }
        })

        console.log(this.state)

        return(
            <>
                <div className="groupswrap" style={{paddingRight: "0px", paddingTop: "180px", display: "flex", justifyContent: "space-between"}}>
                    <div className="mastertitlewrap" style={{marginTop: "-195px"}}>
                        {
                            tabs.map(item => {
                                return  <div className={(item.alt == this.state.currentView) ? "mastertab mastertabselect" : "mastertab mastertabselect inactive"} onClick={() => this.setState({currentView: item.alt})}>
                                            {item.name}
                                        </div>
                            })
                        }
                    </div>
                    <div className={this.props.collapsedstate ? "controlswrap ctrlwrap_collapsed" : "controlswrap ctrlwrap_full"} style={{marginTop: "-135px", padding: "5px", justifyContent: "space-between"}}>
                        <div style={{display: "flex"}}>
                            {
                                controlitems.map(item => {
                                    if (item.name == "Print" && this.state.currentView == "grid") {
                                        return <ReactToPrint
                                        trigger={() => {
                                        return <div className="controlitem" key={item.name}>
                                                    <img src={item.img} alt={item.alt} />
                                                    <div>{item.name}</div>
                                                </div>;
                                        }}
                                        content={() => this.componentRef}
                                        onBeforeGetContent={this.hideLayout}
                                        onAfterPrint={this.showLayout}
                                        />
                                    }
                                    
                                    else {
                                        if (item.name !== "Print") {
                                            return  <div className={(!this.state.showRotation && item.name == "Hide Rotation") ? "controlitem active" : "controlitem"} key={item.name} onClick={() => this.toggleModal(item.name)}>
                                                        <img src={item.img} alt={item.alt} />
                                                        <div>{item.name}</div>
                                                    </div>
                                        }
                                    }
                                })
                            }
                        </div>

                        <div style={{display: "flex"}}>
                            {
                                tablecontrolitems.map(item => {
                                    return  <div className={(this.state.tablestatus == item.alt) ? "controlitem active" : "controlitem"} key={item.name} onClick={() => this.toggleTableStatus(item.alt)}>
                                                <img src={item.img} alt={item.alt} />
                                                <div>{item.name}</div>
                                            </div>
                                })
                            }
                        </div>
                    </div>

                    {
                        this.state.currentSelectedId && this.returnTableDialogue()
                    }

                    {
                        this.state.showPlayerModal && 
                        <div className="optionsmodal">
                            <div className="modalbox">
                                <div className="titlebar">
                                    <div>
                                        {
                                            this.state.clickedPlayer ? 

                                            <>Player - {this.state.clickedPlayer.playerName}</>
                                            :
                                            <>Empty Seat - #{this.state.clickedPlayerSeatNum}</>

                                        }
                                        
                                    </div>
                                    <div className="xbutton" onClick={() => this.setState({showPlayerModal: false})}>×</div>
                                </div>
                                <div className="contentwrap">
                                    {
                                        this.state.clickedPlayer ?
                                        <>
                                            <div>
                                                Game: {this.state.clickedPlayer.name}
                                            </div>
                                            <div>
                                                Table: {this.state.clickedPlayer.seatedTable}
                                            </div>
                                            <div>
                                                Player Created: {this.state.clickedPlayer.created}
                                            </div>
                                            <div>
                                                Wait List In: {this.state.clickedPlayer.waitListIn}
                                            </div>
                                            <div>
                                                Wait List Out: {this.state.clickedPlayer.waitListOut}
                                            </div>
                                            <Button onClick={this.removePlayer}>
                                                Quit Game
                                            </Button>
                                        </>
                                        :
                                        <>
                                            <div style={{width: "100%", display: "flex", justifyContent: "space-between"}}>
                                                <Button variant="contained" color="secondary" onClick={() => this.setState({showPlayerModal: false})}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={this.addGuest}>
                                                    Add Guest
                                                </Button>
                                            </div>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    }

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
    
                    {
                        this.state.loading && <PulseLoader
                        css=""
                        size={30}
                        color={"#02113e"}
                        loading={this.state.loading}
                        />
                    }

                    <div style={{display: "flex", flexGrow: "1", width: "100%"}}>

                    <div className="dragwrap">
                        
                        {
                            (!this.state.loading && this.state.currentView == "rotation" && this.state.showRotation) && 
                            <DragDropContext onDragEnd={this.onDragEnd}>

                                {
                                    [...Array(this.state.totalRotations)].map((d, index) => {
                                        let i = index + 1;
                                        return <div style={{height: "100%"}}>
                                                    <div className="dragtitlewrap">
                                                        <div className="left">{`${this.state[`droppable${i}name`]}`}</div>
                                                        {this.state.currentSelectedRotation !== `droppable${i}` && <div className="right" onClick={() => this.expandRotation(`droppable${i}`)}>{">"}</div>}
                                                    </div>
                                                    <Droppable droppableId={`droppable${i}`}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                style={this.getListStyle(snapshot.isDraggingOver, null, `droppable${i}`)}>
                                                                {this.state[`droppable${i}`].map((item, index) => (
                                                                    <Draggable
                                                                        key={item.id}
                                                                        draggableId={item.id}
                                                                        index={index}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                className={"draggableitemwrap " + this.getOccupancyColor(item)}
                                                                                >
                                                                                    <div className="left">
                                                                                        <div style={(item.tableData && item.tableData.gameColor) ? {backgroundColor: item.tableData.gameColor, color: "#ffffff"} : {}} className={this.state.currentSelectedRotation == `droppable${i}` ? "tablebox" : "tablebox tbsmall"}>{item.name}</div>
                                                                                        {(item.tableData && item.tableData.employeeFirstName && this.state.currentSelectedRotation !== `droppable${i}`) && <div className="dealeritem">D</div>}
                                                                                        {this.state.currentSelectedRotation == `droppable${i}` && 
                                                                                            <div className="game" onClick={((item.name == "CST" || item.name == "BRK") && item.id !== this.state.currentSelectedCustom) ? () => this.unlockCustom(item, index, `droppable${i}`) : () => {}}>
                                                                                                {(item.tableData && item.id !== this.state.currentSelectedCustom) && <>{item.tableData.gameName}</>}
                                                                                                {(item.tableData && item.id == this.state.currentSelectedCustom) && <><input type="text" onChange={(e) => this.updateSelectedCustominput(e)} className="customiteminput" placeholder={`${item.tableData.gameName}`}/><div className="greensuccesssmall" onClick={() => this.saveCustomInput(item, index, `droppable${i}`)}>✔</div></>}
                                                                                            </div>}
                                                                                    </div>
                                                                                    {
                                                                                        this.state.currentSelectedRotation == `droppable${i}` &&
                                                                                            <div className="right">
                                                                                                <div style={(item.tableData && item.tableData.fixedTime && timeChecker(item.tableData.fixedTime) == true) ? {color: "darkred"} : {}}>{(item.tableData && item.tableData.employeeFirstName) && <>{item.tableData.employeeFirstName + " " + item.tableData.employeeLastName[0] + "."}</>}</div>
                                                                                                <div style={(item.tableData && item.tableData.fixedTime && timeChecker(item.tableData.fixedTime) == true) ? {color: "darkred"} : {}}>
                                                                                                    {(item.tableData && item.tableData.fixedTime) && <>{item.tableData.fixedTime}</>}
                                                                                                </div>
                                                                                            </div>
                                                                                    }
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </div>
                                    })
                                }
                                <div style={{height: "100%"}}>
                                    <div className="dragtitlewrap">
                                        <div className="left" style={{width: "100%", textAlign: "center"}}>Tables</div>
                                    </div>
                                    <Droppable droppableId="droppable4">
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                style={this.getListStyle(snapshot.isDraggingOver, "tables")}>
                                                {this.state.droppable4.map((item, index) => (
                                                    <Draggable
                                                        key={item.id}
                                                        draggableId={item.id}
                                                        index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={"draggableitemwrap " + this.getOccupancyColor(item)}>
                                                                    <div className="left">
                                                                        <div style={(item.tableData && item.tableData.gameColor) ? {backgroundColor: item.tableData.gameColor, color: "#ffffff"} : {}} className="tablebox tbsmall">{item.name}</div>
                                                                        {(item.tableData && item.tableData.employeeFirstName) && <div className="dealeritem">D</div>}
                                                                        {/* <div className="game"></div> */}
                                                                    </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            </DragDropContext>
                        }

                        </div>

                        {
                            this.state.currentView == "grid" &&
                            <>
                            <CustomScrollbars autoHide className="gridcontainer" style={{ height: "calc(100vh - 100px)", width: (this.state.showLayout) ? "70%" : "100%", marginTop: "0px" }} ref={el => (this.componentRef = el)}>
                                {
                                    [...Array(this.state.totalRotations)].map((num, index) => {
                                        let droppablenum = index + 1;

                                        return  <>
                                                    <div className="gridviewtitlebar">
                                                        {this.state[`droppable${droppablenum}name`]}
                                                    </div>
                                                    <BootstrapTable
                                                        bootstrap4
                                                        keyField='id'
                                                        data={ data[`droppable${droppablenum}`] }
                                                        columns={ columns }
                                                        selectRow={ selectRow }
                                                        onClick={this.selected }
                                                        rowClasses={ rowClasses }
                                                        height="500px"
                                                        headerClasses="header-override"
                                                    />
                                                </>
                                    })
                                }
                            </CustomScrollbars>
                            </>
                        }


                        {
                            this.state.messageTablesModal &&
                            <div className="optionsmodal">
                                <div className="modalbox">
                                    <div className="titlebar">
                                        <div>Message Tables</div>
                                        <div className="xbutton" onClick={() => this.setState({messageTablesModal: false})}>×</div>
                                    </div>
                                    <div className="contentwrap">
                                        <div className="messagearea">
                                            <textarea placeholder="Send Message" value={this.state.allTableMessage} onChange={(e) => this.updateAllTablesMessage(e)}></textarea>
                                            <div className="button" onClick={this.sendMessageToAllTables}>Send</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }

                        <div style={(!this.state.showRotation) ? {width: `calc(100%)`} : {width: `calc(100% - 750px)`}} ref={node => {
                        this.container = node;
                        }}>

                            <Stage width={(!this.state.showRotation) ? this.state.stageWidth : this.state.stageWidth + 1} height={window.innerHeight} scaleX={(this.state.stageWidth * 0.74) / this.state.canvasheight2} scaleY={this.state.stageWidth / (this.state.canvasheight2 * 1.26)} style={{backgroundColor: "#ffffff"}}>
                                <Layer>
                                    {
                                        fixedDisplays.map((item, index) => {
                                            return this.createTable(item, index);
                                        })
                                    }
                                </Layer>
                            </Stage>

                        </div>
                    
                    </div>
                </div>
        </>
        );
    }
}

const mapStateToProps = state => ({
    navigation: state.updateNavigation.nav
})

const mapDispatchToProps = dispatch => ({ 
    // sendWebsocketMessage: (data) => dispatch(sendWebsocketMessage(data))
})

export default connect(mapStateToProps, mapDispatchToProps)(DealerRotation);