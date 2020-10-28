import { ProtobufHandler } from "./protobufs/protobufhandler";
import EventTarget from "@ungap/event-target"; // EventTarget polyfill for Edge and Safari
import { NodeInfo } from "./sharedTypes";
import { Message } from "protobufjs";

/**
 * Stores and manages Node objects
 * @extends EventTarget
 */
export class NodeDB extends EventTarget {
  /**
   * Short description
   * @todo fix types for protobufs
   */
  nodes: Map<number, NodeInfo | Message<{}> | any>;

  constructor() {
    super();

    /** @type {Map} */
    this.nodes = new Map();
  }

  /**
   * Adds a node object to the database.
   * @param nodeInfo Information about the new node
   * @returns number of node added
   */
  addNode(nodeInfo: NodeInfo) {
    this.nodes.set(nodeInfo.num, nodeInfo);
    this._dispatchInterfaceEvent("nodeListChanged", nodeInfo.num);
    return nodeInfo.num;
  }

  /**
   * Adds user data to an existing node. Creates the node if it doesn't exist.
   * @param nodeInfo  Information about the node for the user data to be assigned to
   * @returns number of node modified
   */
  addUserData(nodeNumber: number, user) {
    let node = this.nodes.get(nodeNumber);

    if (node === undefined) {
      let nodeInfo = {
        num: nodeNumber,
        position: {},
        user: user,
      } as NodeInfo;

      try {
        this.nodes.set(
          nodeNumber,
          ProtobufHandler.toProtobuf("NodeInfo", nodeInfo).obj
        );
      } catch (e) {
        throw new Error(
          "Error in meshtasticjs.nodeDB.addUserData:" + e.message
        );
      }

      this._dispatchInterfaceEvent("nodeListChanged", {});

      return nodeNumber;
    }

    node.user = user;
    this._dispatchInterfaceEvent("nodeListChanged", {});

    return nodeNumber;
  }

  /**
   * Adds position data to an existing node. Creates the node if it doesn't exist.
   * @param nodeInfo Information about the node for the potition data to be assigned to
   * @returns number of node modified
   */
  addPositionData(nodeNumber: number, position) {
    let node = this.nodes.get(nodeNumber);

    if (node === undefined) {
      let nodeInfo = {
        num: nodeNumber,
        position: position,
        user: {},
      } as NodeInfo;

      try {
        this.nodes.set(
          nodeNumber,
          ProtobufHandler.toProtobuf("NodeInfo", nodeInfo).obj
        );
      } catch (e) {
        throw new Error(
          "Error in meshtasticjs.nodeDB.addPositionData:" + e.message
        );
      }

      this._dispatchInterfaceEvent("nodeListChanged", nodeNumber);

      return nodeNumber;
    }

    node.position = position;
    this._dispatchInterfaceEvent("nodeListChanged", nodeNumber);

    return nodeNumber;
  }

  /**
   * Removes node from the database.
   * @param nodeNumber Number of the node to be removed
   * @returns number of node removed
   */
  removeNode(nodeNumber: number) {
    this.nodes.delete(nodeNumber);
    this._dispatchInterfaceEvent("nodeListChanged", nodeNumber);
    return nodeNumber;
  }

  /**
   * Gets a node by its node number
   * @param nodeNumber Number of the node to be fetched
   */
  getNodeByNum(nodeNumber: number) {
    if (this.nodes.get(nodeNumber) === undefined) {
      return undefined;
    }

    return this.nodes.get(nodeNumber);
  }

  /**
   * Gets a list of all nodes in the database.
   * @todo Add sort by field option
   * @returns Map with node numbers as keys and NodeInfo objects as value
   */
  getNodeList() {
    return this.nodes;
  }

  /**
   * Gets the associated user id to a node number, if known
   * @param nodeNumber desired nodes number
   * @returns users id
   */
  nodeNumToUserId(nodeNumber: number) {
    let node = this.nodes.get(nodeNumber);

    if (node === undefined || node.user.id === undefined) {
      return undefined;
    }

    return node.user.id;
  }

  /**
   * Gets the node number to a user id, if known
   * @param userId Desired users id
   * @returns nodes number
   */
  userIdToNodeNum(userId: string) {
    let nodeNumber: number = undefined;

    this.nodes.forEach((node, _num, __map) => {
      if (node.hasOwnProperty("user") === true) {
        if (node.user.id === userId) {
          nodeNumber = node.num;
        }
      }
    });

    return nodeNumber;
  }

  /**
   * Short description
   * @param eventType
   * @param payload
   */
  _dispatchInterfaceEvent(eventType, payload) {
    this.dispatchEvent(new CustomEvent(eventType, { detail: payload }));
  }
}