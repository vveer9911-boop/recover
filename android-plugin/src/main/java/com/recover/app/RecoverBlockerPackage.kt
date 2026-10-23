package com.recover.app

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class RecoverBlockerPackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return if (name == "RecoverBlockerModule") {
            RecoverBlockerModule(reactContext)
        } else {
            null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                "RecoverBlockerModule" to ReactModuleInfo(
                    "RecoverBlockerModule",
                    "com.recover.app.RecoverBlockerModule",
                    false,
                    false,
                    false,
                    false
                )
            )
        }
    }
}
