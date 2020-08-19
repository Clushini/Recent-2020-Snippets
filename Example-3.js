import React, { Component } from 'react';
import { Text, Image, Group, } from 'react-konva';
import PokerTable from '../../media/img/table2.png';
import TableGameTable from '../../media/img/table1.png';
import Konva from 'konva';
import DrawPlayer from './player';
import luminosityCheck from '../../helpers/color';
import { positionModelGenerator, tableTypeTranslator } from './utils';

class Table extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            color: 'green',
            image: null,
            x: 10,
            y: 10,
            rotation: 0,
            textx: 0,
            texty: 0,
            rotateImage: null,
            infoIcon: null,
            playersIcon: null,
            showTableInfo: false,
            isHovering: false,
            playerArray: [],
            item: this.props.item
          };

          this.loadImage = this.loadImage.bind(this);
          this.handleLoad = this.handleLoad.bind(this);
          this.handleInsideDrag = this.handleInsideDrag.bind(this);
          this.handleClick = this.handleClick.bind(this);
          this.updateRotation = this.updateRotation.bind(this);
          this.toggleTableInfo = this.toggleTableInfo.bind(this);
          this.removeTable = this.removeTable.bind(this);
          this.handleDrag = this.handleDrag.bind(this);
          this.deselectItem = this.deselectItem.bind(this);
          this.resetCoordinates = this.resetCoordinates.bind(this);
          this.updateCurrentSelectedTable = this.updateCurrentSelectedTable.bind(this);
          this.constructPositionObjects = this.constructPositionObjects.bind(this);

          this.imageRef = React.createRef();
    }

    constructPositionObjects = (tableData) => {

        let playerArray = [];
        let positionModel = {};
        let gametype = tableTypeTranslator(tableData.tableStationTableType)
        let dealerPosition = {};

        if (gametype == "tablegames") {
            dealerPosition = {
                x: -25, y: 35
            }
        }

        if (gametype == "poker") {
            dealerPosition = {
                x: -25, y: 20
            }
        }

        if (tableData.maxPlayers > 8) {
            gametype = "poker";
        }

        let copySeatInfo = [...tableData.seatInfo];

        copySeatInfo.sort((a, b) => (a.seatNumber > b.seatNumber) ? 1 : -1);

        positionModel = positionModelGenerator(gametype, tableData.maxPlayers);

        let occupiedSeats = [];
        let unoccupiedSeats = [];

        let maxPlayerArray = new Array(tableData.maxPlayers)

        tableData.seatInfo.map(seat => {
            occupiedSeats.push(seat.seatNumber);
        })

        for(var i = 0; i < maxPlayerArray.length + 1; i++){
            if (!occupiedSeats.includes(i)) {
                unoccupiedSeats.push(i);
            }
        }

        tableData.seatInfo.map((seat, index) => {
            if (positionModel[`position${seat.seatNumber}`]) {
                playerArray.push(<DrawPlayer isDealer={false} playerClicked={() => this.props.playerClicked(seat, seat.seatNumber, tableData.tableStationId)} seatinfo={seat} xOffset={positionModel[`position${seat.seatNumber}`].x} yOffset={positionModel[`position${seat.seatNumber}`].y}/>)
            }
        })

        unoccupiedSeats.map(num => {
            if (positionModel[`position${num}`]) {
                playerArray.push(<DrawPlayer isDealer={false} playerClicked={() => this.props.playerClicked(false, num, tableData.tableStationId)} num={num} xOffset={positionModel[`position${num}`].x} yOffset={positionModel[`position${num}`].y}/>)
            }
        })

        if (tableData.employeeId) {
            playerArray.push(<DrawPlayer dealerLive={true} isDealer={true} xOffset={dealerPosition.x} yOffset={dealerPosition.y}/>)
        }

        if (!tableData.employeeId) {
            playerArray.push(<DrawPlayer dealerLive={false} isDealer={true} xOffset={dealerPosition.x} yOffset={dealerPosition.y}/>)
        }

        return playerArray;
    }

    componentWillMount() {
        let tabletype;

        if (this.props.item.tableStationTableType == 1) {
            tabletype = "tablegames";
        } else if (this.props.item.tableStationTableType == 2) {
            tabletype = "poker";
        } else if (!this.props.item.tableStationTableType) {
            tabletype = "tablegames";
        }
        
        //Overriding table picture if max players are greater than 8, as a tablegames cannot have more than 8
        if (this.props.item.maxPlayers > 8) {
            tabletype = "poker";
        }

        this.setState({
            x: this.props.y,
            y: this.props.x,
            textx: this.props.y,
            texty: this.props.x,
            rotation: this.props.rotation,
            tabletype: tabletype
        }, () => {
            this.loadImage();
        })
    }

    componentDidUpdate(oldProps) {
        this.constructPositionObjects(oldProps.item);
        if (oldProps.src !== this.props.src) {
            this.loadImage();
        }

        this.imageRef.current.cache();
        this.imageRef.current.getLayer().batchDraw();
    }

    componentWillUnmount() {
        this.image.removeEventListener('load', this.handleLoad);
    }

    loadImage() {
        this.image = new window.Image();
        this.image.src = (this.state.tabletype == "tablegames") ? TableGameTable : PokerTable;
        this.image.addEventListener('load', this.handleLoad);
    }

    handleLoad = () => {
        this.setState({
            image: this.image,
            rotateimage: this.rotateimage,
            closeicon: this.closeicon,
            playersIcon: this.playersicon
        })
    }

    handleInsideDrag(e) {
        this.setState({
            textx: e.currentTarget.attrs.x,
            texty: e.currentTarget.attrs.y
        })
    }

    handleClick = () => {
        this.setState({
            color: Konva.Util.getRandomColor()
        });
    };

    updateRotation(e) {
        this.setState({
            rotation: this.state.rotation + 10
        }, function() {
            this.props.updateposition(this.props.id, e.currentTarget.attrs.x, e.currentTarget.attrs.y, e.currentTarget.attrs.rotation)
        })
    }
    
    toggleTableInfo() {
        this.setState({
            showTableInfo: !this.state.showTableInfo
        });
    }

    removeTable() {
        this.props.deleteTable(this.props.id);
    }

    handleDrag(e) {
        this.props.selectTable(this.props.id);
    }

    deselectItem(e) {
        this.props.deselectItem();
    }

    resetCoordinates(e) {
        this.setState({
            x: this.props.y,
            y: this.props.x,
            textx: this.props.y,
            texty: this.props.x,
            rotation: this.props.rotation
        })
    }

    updateCurrentSelectedTable() {
        this.props.updateCurrentSelectedTable(this.props.id)
    }

    render() {
        let constructedPositions = this.constructPositionObjects(this.props.item);

        if (this.props.rgb) {
            luminosityCheck(this.props.rgb.red, this.props.rgb.green, this.props.rgb.blue);
        }

        if (this.state.playerArray)
            return (
                <>
                    <Group 
                        rotation={this.state.rotation}
                        x={this.state.textx}
                        y={this.state.texty}
                    >
                        <Image
                            onClick={() => this.props.updateCurrentSelectedTable(this.props.id, this.props.name)}
                            image={this.state.image}
                            stroke={(this.props.id === this.props.selectedTable) ? "#333222" : null}
                            ref={this.imageRef}
                            filters={[Konva.Filters.RGB, Konva.Filters.HSL]}
                            red={this.props.rgb.red}
                            blue={this.props.rgb.blue}
                            green={this.props.rgb.green}
                        />
                        
                        <Text 
                            onClick={() => this.props.updateCurrentSelectedTable(this.props.id)} 
                            x={95} 
                            y={38} 
                            fill={(this.props.tablestatus == "tablegamecolor") ? "#ffffff" : "#000000"} 
                            fontSize={"32"} 
                            fontStyle={"bold"}
                            text={this.props.name}
                        />

                        {
                            constructedPositions.map(player => {
                                return player
                            })
                        }
                    </Group>

                </>
            );
        }
  }

  export default Table;