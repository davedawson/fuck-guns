import React, { useEffect, useState, useRef } from "react";
import ReactGA from "react-ga";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";
import web3 from "web3";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  border: none;
  background-color: transparent;
  padding: 10px;
  font-weight: bold;
  letter-spacing: 0.1em;
  color: var(--secondary-text);
  font-size: 25px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 100%;
  max-width: 150px;
  @media (min-width: 767px) {
    max-width: 200px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
  margin-bottom: 4rem;
`;

export const StyledImg = styled.img`
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

const User = () => {
  const { authenticate, isAuthenticated, user } = useMoralis();

  if (!isAuthenticated) {
    return (
      <div>
        <button onClick={() => authenticate()}>Authenticate</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Hi {user.get('username')}</h1>
    </div>
  );
};


function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(``);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "0xcC28739a14C0D563c72f09dbB0045071399c3e2F",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "Fuck. Guns.",
    SYMBOL: "FKGNS",
    MAX_SUPPLY: 3333,
    WEI_COST: 1000000000000000,
    DISPLAY_COST: 0.001,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Mint confirmed. Thank you for supporting Fuck Guns and Everytown For Gun Safety.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 5) {
      newMintAmount = 5;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    console.log(config);
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  const TRACKING_ID = "G-NWSZG3ZRVC"; // OUR_TRACKING_ID
  ReactGA.initialize(TRACKING_ID);

  return (
    <>
    <s.Screen>
      <s.Container
        flex={1}
        ai={"left"}
        style={{ 
          backgroundColor: "var(--primary)",
        }}
        // image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        {/* <h1>TEST NFT WATERMARK</h1> */}
        <StyledLogo alt={"logo"} src={"/config/images/fuck-guns-nft-logo.png"} />
        <s.SpacerSmall />
        <div className="description">
          <h1><strong>FUCK GUNS</strong></h1>
          <p>We can’t take anymore doom scrolling. It’s time to DO SOMETHING.</p>
          <p>The tragedy in Uvalde, Texas should have never happened. Gun violence is a uniquely American problem and we are tired of inaction.</p>
          <p>Let’s harness the power of the community in Web3 to show our support for ending these senseless acts of violence and donate to organizations that are critical in the fight to end gun violence.</p>
          <p>We are releasing a limited edition NFT of 2500 at a mint price of .01 ETH + gas. All proceeds from the mint and secondary sales go directly to the ETH wallet via smart contract to <a href="https://www.everytown.org/">Everytown for Gun Safety</a>. We encourage you to inspect the contract to confirm.</p>
          <p>This project is not associated with Everytown for Gun Safety.</p>
        </div>
        <ResponsiveWrapper flex={1} style={{ padding: 0 }}>
          <s.Container
            flex={2}
            jc={"start"}
            ai={"left"}
            style={{
              padding: 0,
            }}
          >
          {blockchain.account === "" ||
              blockchain.smartContract === null ? (
                <s.Container ai={"center"} jc={"center"} fd={"row"}>
                  <StyledButton
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch(connect());
                      getData();
                    }}
                  >
                    CONNECT
                  </StyledButton>
                  <s.SpacerSmall />
                  {/* <s.TextDescription
                    style={{
                      textAlign: "left",
                      color: "var(--accent-text)",
                    }}
                  >
                    Connect to the {CONFIG.NETWORK.NAME} network
                  </s.TextDescription> */}                  
                  {blockchain.errorMsg !== "" ? (
                    <>
                      <s.SpacerSmall />
                      <s.TextDescription
                        style={{
                          textAlign: "left",
                          color: "var(--accent-text)",
                        }}
                      >
                        {blockchain.errorMsg}
                      </s.TextDescription>
                    </>
                  ) : null}
                </s.Container>
              ) : (
                <>
                <s.Container ai={"center"} jc={"center"} fd={"row"}>
                    <StyledRoundButton
                      style={{ lineHeight: 0.4 }}
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        decrementMintAmount();
                      }}
                    >
                      -
                    </StyledRoundButton>
                    <s.SpacerMedium />
                    <s.TextDescription
                      style={{
                        textAlign: "left",
                        color: "var(--accent-text)",
                      }}
                    >
                      {mintAmount}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <StyledRoundButton
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        incrementMintAmount();
                      }}
                    >
                      +
                    </StyledRoundButton>
                    <s.SpacerSmall />
                    <StyledButton
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                        getData();
                      }}
                    >
                      {claimingNft ? "minting" : "MINT"}
                    </StyledButton>
                  <s.SpacerMedium />
                  <s.TextDescription
                    style={{
                      textAlign: "left",
                      color: "var(--accent-text)",
                    }}
                  >
                    {feedback}
                  </s.TextDescription>  
                  </s.Container>
                </>
              )}
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 20,
                fontWeight: "bold",
                color: "var(--accent-text)",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY} minted
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "left", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "left", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                {/* <s.TextTitle
                  style={{ textAlign: "left", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL}.
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "left", color: "var(--accent-text)" }}
                >
                  Excluding gas fees.
                </s.TextDescription>
                <s.SpacerSmall /> */}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          {/* <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{ transform: "scaleX(-1)" }}
            />
          </s.Container> */}
        </ResponsiveWrapper>
        <s.SpacerMedium />
        {/* <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            Please make sure you are connected to the right network (
            {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
            Once you make the purchase, you cannot undo this action.
          </s.TextDescription>
          <s.SpacerSmall />
          <s.TextDescription
            style={{
              textAlign: "center",
              color: "var(--primary-text)",
            }}
          >
            We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
            successfully mint your NFT. We recommend that you don't lower the
            gas limit.
          </s.TextDescription>
        </s.Container> */}
      <s.SpacerMedium />
      
        
      </s.Container>
      <s.Container
        flex={1}
        ai={"left"}
        className="faq"
        style={{ 
          
        }}
      >
        <s.TextTitle
            style={{
              textAlign: "left",
              fontSize: 50,
              fontWeight: "bold",
              color: "var(--accent-text)",
            }}
          >
            FAQs
          </s.TextTitle>
          <div className="description">
            <h3>Why an NFT?</h3>
            <p>NFT&rsquo;s and the community bring a unique opportunity to combine self expression with the utilization of cc0 assets (thank you <a href="https://nouns.wtf/">Nouns DAO</a>!), as well as smart contracts to directly support organizations and causes.</p>
            <h3>What is the NFT supply?</h3>
            <p>2500 identical NFTs</p>
            <h3>Will all the money go directly to the organizations?</h3>
            <p>Yes. The withdrawal function in the minting contract deposits all funds directly into Everytown for Gun Safety’s eth wallet. We'll initiate the transaction once the project mints out. You can inspect the contract code here to confirm. All secondary sales will also go directly to that wallet.</p>
            <h3>Who made this?</h3>
            <p>Two concerned parents who, just like you, are fed up with the lack of action and solutions to gun violence. <a href="https://twitter.com/davedawson">Dave</a> has a background in design and web products for mission driven organizations and <a href="https://twitter.com/Samantha__Couch">Sam</a> works in nonprofit and political advocacy fighting for justice and equity.&nbsp;</p>
          </div>
      </s.Container>

      

    </s.Screen>
    </>
  );
}

export default App;
