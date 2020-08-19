import React, { Component } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import Column from './waitlist/column';
import Notifications from './waitlist/notifications';
import Controls from './waitlist/controls';
import Left from './waitlist/left';
import WaitListModal from './waitlist/waitlistmodal';
import { findCurrentNavItem } from '../../../helpers/navfinder';
import { getWaitsByGameGroupId, getTableDisplays } from '../../../calls/index';
import { connect } from 'react-redux';
import { connectmessage } from '../../../constants/index';
import { sendNotification } from '../calls/ws';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import PulseLoader from "react-spinners/PulseLoader";
import PokerTable from '../../../media/img/table2.png';
import TableGamesTable from '../../../media/img/table1.png';

export const grid = 8;

class WaitListMain extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pageWidth: window.innerWidth,
            currentControl: null,
            loading: true,
            totalDroppables: 0
        }

        this.setPageWidth = this.setPageWidth.bind(this);
        this.reorder = this.reorder.bind(this);
        this.move = this.move.bind(this);
        this.getListStyle = this.getListStyle.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.getWaitListColumnWidth = this.getWaitListColumnWidth.bind(this);
        this.getAndSetWaits = this.getAndSetWaits.bind(this);
        this.getAndSetTableLayout = this.getAndSetTableLayout.bind(this);
    }

    client = new W3CWebSocket(window.Configs.websocket);

    getWaitListColumnWidth() {
        let waitListColumnsWidth = '1082px';

        if (this.state.pageWidth > 2078) {
            waitListColumnsWidth = '1305px';
        }
    
        if (this.state.pageWidth < 1869) {
            waitListColumnsWidth = '925px';
        }
    
        if (this.state.pageWidth < 1659) {
            waitListColumnsWidth = '635px';
        }

        return waitListColumnsWidth;
    }

    getList = id => this.state[id];

    getListStyle(isDraggingOver, type, droppable) {
        return {
            background: isDraggingOver ? 'lightblue' : '#F4F5F7',
            padding: grid,
            width: '100%',
            minWidth: '100%',
            height: "calc(100% - 155px)",
            borderRadius: "0px 0px 4px 4px",
            WebkitTransition: 'all', // note the capital 'W' here
            msTransition: 'all', // 'ms' is the only lowercase vendor prefix
            backgroundColor: "#ffffff",
            overflowY: "scroll",
            overflowX: "none"
        }
    }

    reorder(list, startIndex, endIndex) {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
    
        return result;
    };

    move(source, destination, droppableSource, droppableDestination, tables) {
        const sourceClone = Array.from(source);
        const destClone = Array.from(destination);
        let currentname = sourceClone[droppableSource.index].name; 
        const [removed] = sourceClone.splice(droppableSource.index, 1);
        destClone.splice(droppableDestination.index, 0, removed);
        const result = {};

        result[droppableSource.droppableId] = sourceClone;
        result[droppableDestination.droppableId] = destClone;
    
        return result;
    }

    onDragEnd(result) {
        const { source, destination } = result;

        if (!destination) {
            return;
        }

        if (source.droppableId === destination.droppableId) {
            const rotation = this.reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            );

            let copyState = Object.assign({}, this.state)
            copyState[source.droppableId] = rotation;
            this.setState(copyState)
        } else {
            const result = this.move(
                this.getList(source.droppableId),
                this.getList(destination.droppableId),
                source,
                destination
            );

            this.setState(result)
        }
    };

    getAndSetWaits() {
        let copyState = Object.assign({}, this.state);
        let currentNavItem = findCurrentNavItem(this.props.navigation);

        getWaitsByGameGroupId(currentNavItem.gameGroupId).then((response) => {
            const nodes = response.data.data.gameGroupWaits.nodes;
            let totalDroppables = nodes.length;
            [...Array(totalDroppables)].map((num, index) => {
                let i = index + 1;
                copyState[`droppable${i}`] = [];
                copyState[`droppable${i}id`] = uuidv4();
                copyState[`droppable${i}name`] = "";
                copyState[`droppable${i}object`] = nodes[index];
                nodes[index].waitInfo.map(waiter => {
                    copyState[`droppable${i}`].push(waiter)
                })
            })
            copyState.totalDroppables = totalDroppables;
            copyState.loading = false;
            console.log(nodes)
            this.setState(copyState);
        })
    }

    getAndSetTableLayout() {
        let currentNavItem = findCurrentNavItem(this.props.navigation);
        getTableDisplays(currentNavItem.tableLayoutId).then((response) => {
            let nodes = [...response.data.data.tableDisplays.nodes];
            this.props.setLayoutData(nodes)
            // this.setState({
            //     layoutData: nodes
            // })
        })
    }

    async componentWillMount() {
        let currentNavItem = await findCurrentNavItem(this.props.navigation);
        console.log(currentNavItem)
        this.setState({
            currentGameGroupId: currentNavItem.gameGroupId,
            currentGameGroupName: currentNavItem.gameGroupName,
            currentLayoutId: currentNavItem.tableLayoutId,
            currentLayoutName: currentNavItem.tableLayoutName
        }, () => {
            this.getAndSetWaits()
            this.getAndSetTableLayout();
        })
    }

    componentDidMount() {
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
            // if (res["Msg_Type"] == "TablePublish") {
            //     if (res["Msg_Action"] == "TableUpdate") {
            //         let stationId = res.StationId.replace(/-/g, "");
            //         this.updateTableFromTablePublish(stationId);
            //     }
            // }
        };
        window.addEventListener('resize', this.setPageWidth); 
    }

    setPageWidth() {
        this.setState({
            pageWidth: window.innerWidth
        })
    }
    
    render() {

        console.log(this.state);

        let tableImagesData = {pokerTable: PokerTable, tableGamesTable: TableGamesTable};
    
        return(
            <div className="waitlistwrap">
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
                    <>
                        <Left layoutData={this.props.layoutData} sendControl={this.props.sendControl} />

                        {
                            this.state.currentControl && <WaitListModal type={this.state.currentControl} closeModal={this.props.closeControl}/>
                        }

                        <div className="right">
                            <Controls sendControl={this.sendControl}/>

                            <div className="rightinnerwrap">
                                <div className="waitlistcolumns" >

                                    <DragDropContext onDragEnd={this.onDragEnd}>

                                        {
                                            [...Array(this.state.totalDroppables)].map((d, index) => {
                                                let i = index + 1;
                                                return (
                                                    <Column 
                                                        droppableId={`droppable${i}`} 
                                                        getStyle={() => this.getListStyle()} 
                                                        droppableItems={this.state[`droppable${i}`]}
                                                        droppableData={this.state[`droppable${i}object`]}
                                                    />
                                                );
                                            })
                                        }

                                    </DragDropContext>

                                </div>

                                <Notifications layoutData={this.props.layoutData}/>
                            </div>
                        </div>
                    </>
                }
            </div>
        );
    }
}

const mapStateToProps = state => ({
    navigation: state.updateNavigation.nav
})

const mapDispatchToProps = dispatch => ({ 
    
})

export default connect(mapStateToProps, mapDispatchToProps)(WaitListMain);