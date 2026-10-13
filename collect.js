(function () {
    'use strict';

    var CHAINS = {
        '10': { hex: '0xa', name: 'OP Mainnet', rpc: 'https://mainnet.optimism.io',
                explorer: 'https://optimistic.etherscan.io' },
        '7777777': { hex: '0x76adf1', name: 'Zora', rpc: 'https://rpc.zora.energy',
                     explorer: 'https://explorer.zora.energy' },
        '8453': { hex: '0x2105', name: 'Base', rpc: 'https://mainnet.base.org',
                  explorer: 'https://basescan.org' }
    };

    function pad(x) { return x.replace(/^0x/, '').toLowerCase().padStart(64, '0'); }
    function num(n) { return pad(BigInt(n).toString(16)); }

    function dataCollection(minter, token, qty, to) {
        var ma = pad(to);
        return '0x731133e9' + pad(minter) + num(token) + num(qty) + num(0x80)
             + num(ma.length / 2) + ma;
    }

    function dataStrategy(collection, token, qty, to) {
        return '0xa836f32f' + pad(to) + num(qty) + pad(collection) + num(token)
             + pad('0x0000000000000000000000000000000000000000') + num(0xc0)
             + num(0);
    }

    function say(btn, msg, href) {
        var n = btn.parentNode.querySelector('.collect-say');
        if (!n) {
            n = document.createElement('span');
            n.className = 'collect-say';
            btn.parentNode.appendChild(n);
        }
        n.textContent = '';
        if (href) {
            var a = document.createElement('a');
            a.href = href; a.target = '_blank'; a.rel = 'noopener'; a.textContent = msg;
            n.appendChild(a);
        } else { n.textContent = msg; }
    }

    async function collect(btn) {
        var eth = window.ethereum;
        if (!eth) { return; }
        var chainId = btn.dataset.chain, chain = CHAINS[chainId];
        if (!chain) { say(btn, 'unknown network'); return; }
        var was = btn.textContent;
        btn.disabled = true; btn.textContent = 'Check your wallet';
        try {
            var accounts = await eth.request({ method: 'eth_requestAccounts' });
            var from = accounts[0];
            if (!from) { throw new Error('no account'); }

            try {
                await eth.request({ method: 'wallet_switchEthereumChain',
                                    params: [{ chainId: chain.hex }] });
            } catch (e) {
                if (e && (e.code === 4902 || (e.data && e.data.originalError &&
                    e.data.originalError.code === 4902))) {
                    await eth.request({ method: 'wallet_addEthereumChain', params: [{
                        chainId: chain.hex, chainName: chain.name,
                        rpcUrls: [chain.rpc], blockExplorerUrls: [chain.explorer],
                        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
                    }] });
                } else { throw e; }
            }

            var qty = 1;
            var strategy = btn.dataset.path === 'strategy';
            var to = strategy ? btn.dataset.minter : btn.dataset.collection;
            var data = strategy
                ? dataStrategy(btn.dataset.collection, btn.dataset.token, qty, from)
                : dataCollection(btn.dataset.minter, btn.dataset.token, qty, from);
            var value = '0x' + (BigInt(btn.dataset.fee) * BigInt(qty)).toString(16);

            btn.textContent = 'Confirm in your wallet';
            var hash = await eth.request({ method: 'eth_sendTransaction',
                params: [{ from: from, to: to, data: data, value: value }] });
            btn.textContent = 'Sent';
            say(btn, 'View the transaction', chain.explorer + '/tx/' + hash);
        } catch (e) {
            var m = (e && (e.message || e.reason)) || 'something went wrong';
            if (e && e.code === 4001) { m = 'cancelled'; }
            say(btn, m.length > 90 ? m.slice(0, 90) + '…' : m);
            btn.textContent = was; btn.disabled = false;
        }
    }

    function init() {
        var btns = document.querySelectorAll('.collect');
        if (!btns.length) { return; }
        if (!window.ethereum) {
            for (var i = 0; i < btns.length; i++) { btns[i].hidden = true; }
            return;
        }
        for (var j = 0; j < btns.length; j++) {
            btns[j].hidden = false;
            btns[j].addEventListener('click', function (ev) {
                ev.preventDefault(); collect(this);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else { init(); }
}());
