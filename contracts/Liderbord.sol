//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Liderbord {
    struct Resource {
        mapping(string => uint) scores;
        string[] liderbords;
        mapping(address => uint) voters;
        address owner;
    }
    mapping(string => Resource) private resources;
    mapping(string => string[]) private liderbords;

    function getLiderbord(string memory _liderbordName) public view returns (string[] memory, uint[] memory) {
        console.log("Getting liderbord '%s'", _liderbordName);
        uint n = liderbords[_liderbordName].length;
        string[] memory links = new string[](n);
        uint[] memory scores = new uint[](n);
        for (uint i = 0; i < n; i++) {
            Resource storage resource = resources[liderbords[_liderbordName][i]];
            links[i] = liderbords[_liderbordName][i];
            scores[i] = resource.scores[_liderbordName];
        }
        return (links, scores);
    }

    function addResource(string memory _link, string[] memory _liderbordNames) public {
        console.log("Adding resource '%s'", _link);
        Resource storage resource = resources[_link];
        for (uint i = 0; i < _liderbordNames.length; i++) {
            string memory liderbordName = _liderbordNames[i];
            resource.liderbords.push(liderbordName);
            liderbords[liderbordName].push(_link);
        }
    }
}
