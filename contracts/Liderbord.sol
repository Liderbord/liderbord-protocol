//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Liderbords {
    struct Score {
        uint value;
        uint index;
    }
    struct Resource {
        mapping(string => Score) scores;
        string[] liderbords;
        address owner;
    }
    struct Liderbord {
        uint length;
        mapping(uint => string) resources;
        mapping(address => uint) voters;
    }
    mapping(string => Resource) private resources;
    mapping(string => Liderbord) private liderbords;

    function getLiderbord(string memory _liderbordName) public view returns (string[] memory, uint[] memory) {
        console.log("Getting liderbord '%s'", _liderbordName);
        uint n = liderbords[_liderbordName].length;
        string[] memory links = new string[](n);
        uint[] memory scores = new uint[](n);
        for (uint i = 0; i < n; i++) {
            Resource storage resource = resources[liderbords[_liderbordName].resources[i]];
            links[i] = liderbords[_liderbordName].resources[i];
            scores[i] = resource.scores[_liderbordName].value;
        }
        return (links, scores);
    }

    function addResource(string memory _link, string[] memory _liderbordNames) public {
        console.log("Adding resource '%s'", _link);
        // require that the resource does not exist
        Resource storage resource = resources[_link];
        for (uint i = 0; i < _liderbordNames.length; i++) {
            string memory liderbordName = _liderbordNames[i];
            resource.liderbords.push(liderbordName);
            Liderbord storage liderbord = liderbords[liderbordName];
            resource.scores[liderbordName] = Score({value: 0, index: liderbord.length});
            liderbord.resources[liderbord.length] = _link;
            liderbord.length++;
        }
    }

    function deleteResource(string memory _link) public {
        console.log("Deleting resource '%s'", _link);
        Resource storage resource = resources[_link];
        for (uint i = 0; i < resource.liderbords.length; i++) {
            Liderbord storage liderbord = liderbords[resource.liderbords[i]];
            liderbord.resources[resource.scores[resource.liderbords[i]].index] = liderbord.resources[liderbord.length - 1];
            liderbord.length--;
        }
        delete resources[_link];
    }

    function vote(string memory _link, string memory _liderbordName, uint _side) public {
        Resource storage resource = resources[_link];
        Liderbord storage liderbord = liderbords[_liderbordName];
        require(resource.owner != msg.sender, "Can't vote on your own resource");
        require(liderbord.voters[msg.sender] == 0, "Can't voted in this resource");
        require(_side != 0, "Need to vote on a side");
        console.log("Voting for '%s' in '%s'", _link, _liderbordName);
        liderbord.voters[msg.sender] = _side;
        resource.scores[_liderbordName].value += _side;
    }
}
