// Explicit browser-shadow recipes copied only from versioned seed/migration
// evidence. They contain no price and never discover or substitute products.
const detail = (name, url, quantity) => ({ name, url, quantity });
export const VERSIONED_COMPONENT_DETAILS = Object.freeze({
  hotsound: {
    r1: [detail('LD Systems MAUI 11 G3', 'https://www.hotsound-store.com/ld-systems-maui-11-g3-11673', 2)],
    r6: [detail('LD Systems MAUI 28 G3 W weiß', 'https://www.hotsound-store.com/ld-systems-maui-28-g3-w-weiss-11672', 2)],
    r7: [detail('LD Systems MAUI 28 G3 MIX schwarz', 'https://www.hotsound-store.com/ld-systems-maui-28-g3-mix-schwarz-13382', 2)],
    r9: [detail('LD Systems MAUI 44 G2 SET2', 'https://www.hotsound-store.com/ld-systems-maui-44-g2-set2-12232', 1), detail('LD Systems MAUI 44 G2 SUB PC', 'https://www.hotsound-store.com/ld-systems-maui-44-g2-sub-pc-12144', 2), detail('LD Systems MAUI 44 G2 SAT BAG', 'https://www.hotsound-store.com/ld-systems-maui-44-g2-sat-bag-12145', 2), detail('LD Systems MAUI 44 G2 CB', 'https://www.hotsound-store.com/ld-systems-maui-44-g2-cb-12143', 2)],
    r31: [detail('DAP Frigga weiß', 'https://www.hotsound-store.com/dap-frigga-aktives-saeulen-pa-system-weiss-13258', 2)],
    r36: [detail('Wharfedale Pro Delta X218B', 'https://www.hotsound-store.com/wharfedale-pro-delta-x218b-tough-tone-passiv-pa-subwoofer-4873', 2)],
    r37: [detail('Wharfedale Pro Delta F18B', 'https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063', 2)],
    r38: [detail('Wharfedale Pro Delta F18B', 'https://www.hotsound-store.com/wharfedale-pro-delta-f18b-horngeladener-18-subwoofer-passiv-14063', 4)]
  },
  thomann: {
    r5: [detail('LD Systems Maui 28 G3', 'https://www.thomann.de/de/ld_systems_maui_28_g3.htm', 2)],
    r8: [detail('LD Systems Maui 44 G2', 'https://www.thomann.de/de/ld_systems_maui_44_g2.htm', 2)],
    r9: [detail('LD Systems Maui 44 G2', 'https://www.thomann.de/de/ld_systems_maui_44_g2.htm', 2), detail('LD Systems MAUI 44 G2 SUB BAG', 'https://www.thomann.de/de/ld_systems_maui_44_g2_sub_bag.htm', 2), detail('LD Systems MAUI 44 G2 SAT BAG', 'https://www.thomann.de/de/ld_systems_maui_44_g2_sat_bag.htm', 2), detail('LD Systems Wheelboard for MAUI 44 G2', 'https://www.thomann.de/de/ld_systems_wheelboard_f._maui_44_g2.htm', 2)],
    r23: [detail('LD Systems ICOA 12 A BT', 'https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm', 2), detail('LD Systems ICOA SUB 15 A', 'https://www.thomann.de/de/ld_systems_icoa_sub_15_a.htm', 1), detail('Gravity SS 5211 B Set 1', 'https://www.thomann.de/de/gravity_ss_5211_b_set_1.htm', 1), detail('Sommer Stage 22 SGHN 6 m', 'https://www.thomann.de/de/sommer_cable_stage_22_sghn_bk_60m.htm', 2)],
    r24: [detail('LD Systems ICOA 12 A BT', 'https://www.thomann.de/de/ld_systems_icoa_12_a_bt.htm', 2), detail('LD Systems ICOA SUB 18 A', 'https://www.thomann.de/de/ld_systems_icoa_sub_18_a.htm', 2), detail('Gravity SP 2332 B', 'https://www.thomann.de/de/gravity_sp_2332_b_speaker_stand.htm', 2), detail('Sommer Stage 22 SG0Q 3 m', 'https://www.thomann.de/de/sommer_cable_stage_22_sg0q_3m.htm', 2)],
    r25: [detail('LD Systems ICOA 15 A BT', 'https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm', 2), detail('LD Systems ICOA SUB 18 A', 'https://www.thomann.de/de/ld_systems_icoa_sub_18_a.htm', 2), detail('Gravity SP 2332 B', 'https://www.thomann.de/de/gravity_sp_2332_b_speaker_stand.htm', 2), detail('Sommer Stage 22 SG0Q 3 m', 'https://www.thomann.de/de/sommer_cable_stage_22_sg0q_3m.htm', 2)],
    r26: [detail('LD Systems ICOA 15 A BT', 'https://www.thomann.de/de/ld_systems_icoa_15_a_bt.htm', 2), detail('LD Systems ICOA SUB 18 A', 'https://www.thomann.de/de/ld_systems_icoa_sub_18_a.htm', 4), detail('Sommer Stage 22 SG0Q 3 m', 'https://www.thomann.de/de/sommer_cable_stage_22_sg0q_3m.htm', 4)],
    r27: [detail('LD Systems ICOA Pro 12 A', 'https://www.thomann.de/de/ld_systems_icoa_pro_12_a.htm', 2), detail('LD Systems ICOA SUB Pro 21 A', 'https://www.thomann.de/de/ld_systems_icoa_sub_pro_21_a.htm', 1), detail('LD Systems ICOA 12 Cover', 'https://www.thomann.de/de/ld_systems_icoa_12_cover.htm', 2), detail('LD Systems ICOA PRO SUB 21 Cover', 'https://www.thomann.de/de/ld_systems_icoa_pro_sub_21_cover.htm', 1), detail('LD Systems ICOA PRO SUB 21 Casterboard', 'https://www.thomann.de/de/ld_systems_icoa_pro_sub_21_casterboard.htm', 1), detail('Gravity SS 5211 B Set 1', 'https://www.thomann.de/de/gravity_ss_5211_b_set_1.htm', 1), detail('Sommer Stage 22 SGHN 5 m', 'https://www.thomann.de/de/sommer_cable_stage_22_sghn_bk_50m.htm', 2)]
  }
});
