// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@opengsn/contracts/src/BaseRelayRecipient.sol";

contract Liderbords is BaseRelayRecipient {
    struct Score {
        int256 upvotes;
        int256 downvotes;
        uint256 index;
    }
    struct Resource {
        mapping(string => Score) scores;
        string[] liderbords;
        address owner;
    }
    struct Vote {
        int8 side;
        string resource;
    }
    struct Liderbord {
        uint256 length;
        mapping(uint256 => string) resources;
        mapping(address => Vote) voters;
    }
    struct User {
        uint256 happycoins;
        uint256 lastDateClaimed;
    }
    mapping(string => Resource) private resources;
    mapping(string => Liderbord) private liderbords;
    mapping(address => User) private users;
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "");
        _;
    }

    constructor(address _trustedForwarder) {
        _setTrustedForwarder(_trustedForwarder);
        owner = msg.sender;
    }

    function getLiderbord(string memory _liderbordName)
        public
        view
        returns (
            string[] memory,
            int256[] memory,
            int256[] memory,
            int256[] memory
        )
    {
        uint256 n = liderbords[_liderbordName].length;
        string[] memory links = new string[](n);
        int256[] memory scores = new int256[](n);
        int256[] memory upvotes = new int256[](n);
        int256[] memory downvotes = new int256[](n);
        for (uint256 i = 0; i < n; i++) {
            Resource storage resource = resources[
                liderbords[_liderbordName].resources[i]
            ];
            links[i] = liderbords[_liderbordName].resources[i];
            upvotes[i] = resource.scores[_liderbordName].upvotes;
            downvotes[i] = resource.scores[_liderbordName].downvotes;
            scores[i] = upvotes[i] - downvotes[i];
        }
        return (links, scores, upvotes, downvotes);
    }

    function addResource(string memory _link, string[] memory _liderbordNames)
        public
    {
        require(
            users[msg.sender].happycoins > 1,
            "Need 2 HC to add a resource"
        );
        users[msg.sender].happycoins -= 2;

        // require that the resource does not exist
        Resource storage resource = resources[_link];
        for (uint256 i = 0; i < _liderbordNames.length; i++) {
            string memory liderbordName = _liderbordNames[i];
            resource.liderbords.push(liderbordName);
            Liderbord storage liderbord = liderbords[liderbordName];
            resource.scores[liderbordName] = Score({
                upvotes: 0,
                downvotes: 0,
                index: liderbord.length
            });
            liderbord.resources[liderbord.length] = _link;
            liderbord.length++;
        }
    }

    function getResource(string memory _link)
        public
        view
        returns (string[] memory, Score[] memory)
    {
        Resource storage resource = resources[_link];
        uint256 length = resource.liderbords.length;
        string[] memory liderbordNames = new string[](length);
        Score[] memory scores = new Score[](length);
        for (uint256 i = 0; i < length; i++) {
            liderbordNames[i] = resource.liderbords[i];
            scores[i] = resource.scores[liderbordNames[i]];
        }
        return (liderbordNames, scores);
    }

    function deleteResource(string memory _link) public {
        Resource storage resource = resources[_link];
        for (uint256 i = 0; i < resource.liderbords.length; i++) {
            Liderbord storage liderbord = liderbords[resource.liderbords[i]];
            liderbord.resources[
                resource.scores[resource.liderbords[i]].index
            ] = liderbord.resources[liderbord.length - 1];
            liderbord.length--;
        }
        delete resources[_link];
    }

    function claimHappycoins() public {
        require(users[msg.sender].happycoins < 30, "Maximun of 30 happycoins");
        if (
            users[msg.sender].lastDateClaimed + 86400 > block.timestamp ||
            users[msg.sender].lastDateClaimed == 0
        ) {
            users[msg.sender].lastDateClaimed = block.timestamp;
            if (users[msg.sender].happycoins >= 20) {
                users[msg.sender].happycoins == 30;
            } else {
                users[msg.sender].happycoins += 10;
            }
        } else {
            revert("Can't claim happycoins before 24h");
        }
    }

    function getHappycoins(address _user) public view returns (User memory) {
        return users[_user];
    }

    function vote(
        string memory _link,
        string memory _liderbordName,
        int8 _side
    ) public {
        Resource storage resource = resources[_link];
        Liderbord storage liderbord = liderbords[_liderbordName];
        require(
            resource.owner != msg.sender,
            "Can't vote on your own resource"
        );
        require(_side == 1 || _side == -1, "Vote has to be either 1 or -1");
        require(
            users[msg.sender].happycoins > 0,
            "Need to have happycoins to vote"
        );
        users[msg.sender].happycoins--;

        if (liderbord.voters[msg.sender].side != 0) {
            Resource storage prevResource = resources[
                liderbord.voters[msg.sender].resource
            ];
            if (_side == 1) {
                prevResource.scores[_liderbordName].downvotes--;
            } else {
                prevResource.scores[_liderbordName].upvotes--;
            }
        }

        if (_side == 1) {
            resource.scores[_liderbordName].upvotes++;
        } else {
            resource.scores[_liderbordName].downvotes++;
        }
        liderbord.voters[msg.sender] = Vote({side: _side, resource: _link});
    }

    function setTrustForwarder(address _trustedForwarder) public onlyOwner {
        _setTrustedForwarder(_trustedForwarder);
    }

    function versionRecipient() external pure override returns (string memory) {
        return "1";
    }
}
