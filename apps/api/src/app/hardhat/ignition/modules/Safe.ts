import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const SafeModule = buildModule('SafeModule', (m) => {
    const SimulateTxAccessor = m.contract('SimulateTxAccessor', [], {});
    const GnosisSafeProxyFactory = m.contract('GnosisSafeProxyFactory', [], {});
    const DefaultCallbackHandler = m.contract('DefaultCallbackHandler', [], {});
    const CompatibilityFallbackHandler = m.contract('CompatibilityFallbackHandler', [], {});
    const CreateCall = m.contract('CreateCall', [], {});
    const MultiSend = m.contract('MultiSend', [], {});
    const MultiSendCallOnly = m.contract('MultiSendCallOnly', [], {});
    const SignMessageLib = m.contract('SignMessageLib', [], {});
    const GnosisSafeL2 = m.contract('GnosisSafeL2', [], {});

    return {
        SimulateTxAccessor,
        GnosisSafeProxyFactory,
        DefaultCallbackHandler,
        CompatibilityFallbackHandler,
        CreateCall,
        MultiSend,
        MultiSendCallOnly,
        SignMessageLib,
        GnosisSafeL2,
    };
});

export default SafeModule;
