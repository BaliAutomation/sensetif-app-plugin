export type ttnDevice = {
  ids: {
    device_id: string;
    application_ids: {
      application_id: string;
    };
    dev_eui: string;
    join_eui: string;
  };
  created_at: string;
  updated_at: string;
};

export type msgResult = {
  end_device_ids: {
    device_id: string;
    application_ids: {
      application_id: string;
    };
    dev_eui: string;
    dev_addr: string;
  };
  received_at: string;
  uplink_message: {
    f_port: number;
    f_cnt: number;
    frm_payload: string;
    decoded_payload: any;
    rx_metadata: any;
    settings: any;
    received_at: string;
    confirmed: boolean;
    consumed_airtime: string;
    version_ids: any;
    network_ids: {
      net_id: string;
      tenant_id: string;
      cluster_id: string;
      cluster_address: string;
    };
  };
};

export type loadingValue<T> = {
  isLoading: boolean;
  error?: Error;
  value?: T;
};
