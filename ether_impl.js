async function getAccountInfo() {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()

    const address = await signer.getAddress()
    const balance = await signer.getBalance()
    console.log(`address: ${address}, balcance: ${balance}`)
    return {address, balance}
}
