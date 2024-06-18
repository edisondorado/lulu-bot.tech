const mongoose = require("mongoose");

const UserSchema = mongoose.model("User", new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String
    },
    nickname: {
        type: String,
        required: true,
    },
    avatar: {
        type: String
    },
    url: {
        vk: String,
        forum: String,
    },
    full_access: {
        type: Boolean,
        required: true,
        default: false
    },
    admin: {
        active: {
            type: Boolean,
            required: true,
            default: false
        },
        dismissal: {
            reason: {
                type: String,
                required: true,
                default: "-"
            },
            time: {
                type: Date,
            }
        },
        lvl: {
            type: Number,
        },
        job_title: {
            type: String,
            required: true,
            default: "-",
        },
        additional_job_title: {
            type: String,
            required: true,
            default: "-",
        },
        reason: {
            type: String,
        },
        active_warns: {
            type: Number,
            required: true,
            default: 0,
        },
        appointment_date: {
            type: Date,
        },
        promotion_date: {
            type: Date,
        },
        inactives: [{
            from: {
                type: Date,
                required: true,
            },
            to: {
                type: Date,
                required: true,
            },
            lvl: {
                type: Number,
                required: true
            }
        }],
        free_days: {
            type: Number,
            required: true,
            default: 0,
        },
        day: {
            type: Number,
            required: true,
            default: 0,
        },
        reputation: {
            type: Number,
            required: true,
            default: 0,
        },
        inactiveRequest: {
          messageId: String,
          sent: Boolean,
          time: Date,
          dates: {
            from: Date,
            to: Date,
          },
          reason: String,
        }
    },
    leader: {
        appointment_date: {
            type: Date,
        },
        active: {
            type: Boolean,
            required: true,
            default: false
        },
        job_title: {
            type: String,
        },
        fraction: {
            type: String,
        },
        reason: {
            type: String
        },
        dismissal: {
            reason: {
                type: String,
                required: true,
                default: "-"
            },
            time: {
                type: Date,
            }
        },
        easy_warn: {
            type: Number,
            required: true,
            default: 0,
        },
        hard_warn: {
            type: Number,
            required: true,
            default: 0,
        },
        inactives: [{
            from: {
                type: Date,
                required: true,
            },
            to: {
                type: Date,
                required: true,
            }
        }],
        inactiveRequest: {
          messageId: String,
          sent: Boolean,
          time: Date,
          dates: {
            from: Date,
            to: Date,
          },
          reason: String,
        }
    }
}))

const LogUsers = mongoose.model("LogUsers", new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    issuedBy: {
        id: String,
        nickname: String,
    },
    targetUser: {
        id: String,
        nickname: String,
    },
    status: {
        type: String,
        required: true,
    },
    reason: {
        type: String
    },
    additionalInfo: {
        type: String
    },
    previousValue: {
        type: String
    },
    new_value: {
        type: String
    },
    hidden: {
        status: {
            type: Boolean,
            required: true,
            default: false,
        },
        author: {
            id: String,
            nickname: String,
        }
    }
}))

module.exports = { UserSchema, LogUsers }