const rounderHeader =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAAoCAQAAADEFIMCAAAA/0lEQVR42u3YsW3CQBiG4ZNQXHswp47HgRUcxBaMgZjFyAtA86WIkCKIUNr4f57rrvyKV6draU+ny5Ap58y5BeA/u2XOOVOGvD3X7vGizy6LzYDVWbJL/yqAY2YrAas1Z/w9gJscrAOs3iGbxwBucrQLUMLxnsB7APc2AcrY/wzgaA+glI97APtcrAGUMqf/DuDWFkA527SWzvsPKGhJ1/JuB6CkoeXTCkBJU8vJCkBJp+YHECjq0nK1AlDStdkAqEoAAQEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBBBAAAEEEEAAAQQQQAABBPi7L+gY4vx+2gtdAAAAAElFTkSuQmCC";
const rounderFooter =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAAoCAYAAABuHUuJAAAAAXNSR0IArs4c6QAAA29JREFUeF7t3U1qU2EYBWBvU3WqYBNcgU1xAzbBoU5EmhvizwYKoh24Aa1uQLAVl6AYmhY661CaugFp6gqkiaBThfTKDVZasTru9z6ZJSSD87xncAgNzWr1ZnHGgwABAgQIECBAIIxAZgCGubWgBAgQIECAAIGJgAGoCAQIECBAgACBYAIGYLCDi0uAAAECBAgQMAB1gAABAgQIECAQTMAADHZwcQkQIECAAAECBqAOECBAgAABAgSCCRiAwQ4uLgECBAgQIEDAANQBAgQIECBAgEAwAQMw2MHFJUCAAAECBAgYgDpAgAABAgQIEAgmYAAGO7i4BAgQIECAAAEDUAcIECBAgAABAsEEDMBgBxeXAAECBAgQIGAA6gABAgQIECBAIJiAARjs4OISIECAAAECBAxAHSBAgAABAgQIBBMwAIMdXFwCBAgQIECAgAGoAwQIECBAgACBYAIGYLCDi0uAAAECBAgQMAB1gAABAgQIECAQTMAADHZwcQkQIECAAAECBqAOECBAgAABAgSCCRiAwQ4uLgECBAgQIEDAANQBAgQIECBAgEAwAQMw2MHFJUCAAAECBAgYgDpAgAABAgQIEAgmYAAGO7i4BAgQIECAAIEsz/OX/cFwCQUBAgQIECBAgED6Ao16dTVrtVq3dvZGm+nHlZAAAQIECBAgQKA5V7uddTqdc+8/fv6OgwABAgQIECBAIH2B61cvn8/KmHmeL/cHw6fpR5aQAAECBAgQIBBXoFGvPuv1esuTAbiwsHDhw6cvX+NySE6AAAECBAgQSF/g2pVLFzc2Nr5NBuCvbwHv9gfDt+lHl5AAAQIECBAgEE9gfnbm/vr6+mTr/R6A5ZN2u726vbv/MB6JxAQIECBAgACBdAWac7VXa2trjw4THhuAnU6ncnBw8G57dz9Pl0AyAgQIECBAgEAcgeZcrTc1NXWn2+2O/zoAyxfLETgej1f6g+GDODSSEiBAgAABAgTSE2jUq68rlcrS0fFXpjz2DeDR2K1W697O3uhNehQSESBAgAABAgTSFzj6N39/pj1xAJZvLH8dnGXZ45290ZP0mSQkQIAAAQIECJx+gfnZmedFUbwof+17Upp/DsDDDy0uLp4djUY3syy74d/Gnf5iSECAAAECBAikJdCoV1eKotianp7e6na7P/6X7id3xJVxl9btpgAAAABJRU5ErkJggg==";
const divider =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAATwAAAALCAMAAADV08GVAAACQ1BMVEX////a2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dna2dmIQGnaAAAAwHRSTlMAAFgQKz0HZGtqVRYjSANnaQJMHRosEbNdfZNNyPIJAeIzrWh4nUPTEvQP2KNt+eYeUziIDPe9ze4FmChjLY/xw46gFzB1NwgOSlsxhxsqx7IlIJzdLnH9PEYTL+q/uyeUFP4/C7rG82H6hlHtqzLMJuQK9WaLsdTQtudHkWzZvHOs69Xlt4z4FUnR6FQG9nxQBIHBViHs4d7fqOD7qqTXIrmWX3CFS9LKtUGQZYqNrynPTlokgDaDkmA6hEIYiX/g2yO3AAAFgUlEQVRIx+2W119TWRDHE5YqWEA2gVACUhMgAQNSVGQ3aFCEVSFEIFKCC9gQELtYESwLiHV3ERv2gnWtuDt/2s7knnMy8cGXfd37cH58Pzd3uHfOzPyOTieukB801fuv0DA9u8IjOOkjgygqiBZEc4pZyGnR4u+EWRLLKW4pp/g4TrFLvhNm8SJOC2M4RS/4zosHh4kI5xT2Y+Bvnc4Qovv2Mibw5CWa+MNJyUGfkpLKyJyWzm8uy+CUmcUpO4dTrsXKMS9ou/ILOBXkB31KHierJZdjTjanrExOGcs4paeZGaWmxPObyUmcTIk8eQnGb3NntRl58nLsvBCyoJB/ChQxWg4ORsUlK/h/LS0rZ1QBKxmtggRGq6GSl/qaKh6mag0vhJ9gNaMEWMVoJVQwKi8r5WFWlBQzcsByRkXAt6sQfualbs/hyTParCxxzurq6rVgW4fi0ulrUNYDbEAxYKuh1JbBRpQ6fLQe9RfYhOtmpC2oDdCIqxt3MRq1CTxbUbA0i1GaASJQWjBMK6oXKnGlhlyJug3acG2nV0XtgDRcWzFMJ2oG+LpQtuv121G6fJCB0ollTmHSoANX2s521F9hG660K0tRK8FLYbB3W1AjAJpRMGWpKFs90ISCc8XsRm2EBly34IObUTdBN671SHWoG6GsFgXDGFA2AKxHqdHrXSjrbLAWxSmSV9wA2tXTi5UXm7lDI89OKptdu8XNPdQefXmC9vZTA7cJGqBmGawQtG+I2rnJppFvP5VNklfcPIA50LsPCjpEr+s8LOjIUSTXMUElw5hK83CJwGMuvHn0iKDDTtrKQ4IOupE6DwjyUs+F7/dpZGui9hzaJ25WDNIAGRDURs3av1dQXh+Nkz2Cdu+i4t3p0WhHJvVib4+42VCsaq/In6HkGK1t+44TpXVpdVp3gsjSq5GWIY9Da0fzSX+GTomxk3SaqLRdo9YzRCNiCDnP+vMqRqLL5H+FUa0dzcNjRMZz2s3z/gxdqNeo/gLRxfMandtENDaszavwUX8Yk0sMNX+GzjrFiB0hOtOqUXsp0Wkxy3JP+fN6UgtT7vCovFKGLEQr6jTqSiM63icsMNmf19/4yBuiEmmRM6+WftAsu3x8AmlSNX03lY8iKhO7ol56sE5SKNElSVMpSJfVT69Q+SiiJJxWA/wqPXhN0jWiq8qgaING1YNUtFcUXUZKmZJ0iR4MlVRH1Kt+aqdiVkRF261oEmliXFIzPVgrqYUKeijYa2HEBgkyeYmQch2U3y4Ezw1Qfhvtgd/Bovy2Ef4AUH77J9jHQPltJli8gQGeDb5pUAM89yaGCQzwPJiGwADPh4sTgQFeABMXIT9gUPgf8wIGhWFuKr8thWkfZAcMymsB5bcZMGaHGeW1FKZRea0Fw3jUKSsZbnhAnbJMcD0FEgMGZRsBY7DX3rLW3jbK5OV034m/q/w2azos9Z5P+m1Gz6z5/pj023TPg/KHXod6hxmD+5Hy272P+6OfeOXBq2LgqesZyIPXKstzc1RJiPRa34vxZvuc8tqXna9eK7+tev2q86Xy2zl78/gLn/TbkJIo83OL9NsYeOZ6OiC3a5H3SXT/Y7VdbY/chhm16w7vw/IHHrnrRWP3zbM9ctcLffdSw6azlNfejb/TrfzWeLvWeivIb9+8xWWwskZL3ru/pmjgvxd+30HnsTh5rvhAn++WXbyETmfOj7LAP9E4mzOIPnmAg9Ec+Vl8SgfVx9FZ8dMvZDj1MsxiqpZOk+jbeTKccMdXjb7+TXkbmhddayLDmZfH7UkajP1fBM2S4eR2iO36HGmmgS+miGGUBuMnOYw+0mAMk8ftSTKcmA+yuOhMbu0Qp6z3ZDhT/7zTqKZyEJP09o3u/+s/Xv8Csp1PtOrtsIgAAAAASUVORK5CYII=";

const linkedinIcon =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAAwVJREFUeAHtmctrE0Ecx/OkNYgPBPUieKiwoGzIA29eFERE7Fk8iX+AqHhQT4JX7yKePIpQhOK5PUhRk5B7kFhQCilJDKvWR7Lrd0qGbndntjtlshnILzDMzO83j9/3k3m1SaXoQwSIABEgAkSACBABIkAEiAARIAJEgAgQgRkjkNalt1arWel0+inGqyANkdZyudyjYrH4VdcckxhHCwAmHsE1kA74gwSQDtK5crm86bebVM7oCAYin2CcXeLZuJ7nHXdd956OOSY1hhYAEGrLAgScosxngl0LAIj8FiFmI8I3dZcWAFDxQqJkBDgvJT4jzFoAVCqV1xB6F4p+cVWod1C+gQNwjdtMzLXcAlxYq9WacxzHymazv23b/gwI7Dqkj8kEtK4AnULb7fZ8t9s9g1W0gFuGXbEb+Xz+Ix5WP3XOowUAHkL3EdRDUWDYDrdLpdJb7qvX600IOsnrvrxTrVZtJrzf79/B++EBfMd8/hRg/EH9DfLHOFvW/b79lnP77RjoV0B9V7DcDyFzvMxyiD+K7ITfNi57OEMO9Xq9ZbS5IPCzvmysm8ivNRqNRUBYFbVTsWm5BVQmxLfnytoPBoNXMvGBPofRbhmraSFgV64mDgCBe5Io2bZYlPhCZgxzEMbnIYeiIXEAiE8GQDH07e10qdlsnlXu6OswDQC+6cNFbJFPmUzmKtJpeC+ivhRutWMZDofXd2rqJV2HoPrMgh4Q+wXCL+PW+D52r2Opr+DAe4f8iqALM52X2GOZjVoBEH/LJ35bAKB4SM9kauA7JfPFsRsDAELc0Wj0XhR0oVD4ILIzG1bGEZkvjt0YABCyiYfQP1HQlmU5APRD5IN9XmSPazMGAALe63bYiitKpd00AGh5fquIjGo7DQBR8STuSxwA9uzMr4DZBoDTfrYBYJMTgMRPuogJ6RCMgDMpl1FbQNdfg1u43foiYjj0/gbs7LcDJ2Bj/+8TPnV5O4zD/KFn79jOm1FOBIgAESACRIAIEAEiQASIABEgAkSACBCBPQn8B0E3xW/62IXRAAAAAElFTkSuQmCC";

const websiteIcon =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAABOpJREFUeAHtmFtonEUUx5PN7mZDNZZQU0pJatTU0LC5bVroBQ1a0cTSVsiDD/pWC6WCWNRW2rdWewGr7wVBSB+EUCNii+apTSwUc2kIkWiKMVmrbQLGRrsxm8v6O8lOmCzdzSaZb3eLMzA7Z86c75vz/8+Z881sVpYtlgHLgGXAMmAZsAxYBiwDlgHLgGXAMmAZsAxYBv5nDGRnGt5gMJg3Ojp6IBKJ7MW3TdQJ5Js5OTlN1dXVrab9zSgCOjs7A4C9BMjiOEBbc3Nz3/D7/XfjjC9bnTEEdHV1PQf4b6hrEqHIzs4ecrvduyorK39LZJfsmCtZQyft4oEH7BjzTuhzQ9Cm6enpS7RGfDfyEt3B5cqDg4O+2dnZ5piVv+tyuRoCgUAB71sHEUeoYfVubLeyXV5T/dW0aScgFAqtFZAaiDvIdTU1NVdEV1tbG4KITyDgkGaTRf91vb9SOe0ElJeX3wGMAIwA4iePx1MH6P5YQBDyGTa/a/qAJq9YzJgkKJ+/oqKiRfs9FhVh/z3hv0P0kBEmMnJjbZbbT3sEKIeXAj8wMCBgtyh7iDDyKXSrF6aq7evr805OTsr3/knmnOCAc6Oqqur2UvOPj4+f4hnJF6q0KWE1bcq2gIT4yMjIUUAcxuGFpEcoz6L7Ii8v7y3ywZ8PAkPov4fNOX2Mr4Qkyqu6biVySgjo7u6umpmZacbBp+I5CRG38vPzA6WlpeO6DeDfB/xZXYftRfb/w/EVAPyLgL+WCLyAA+TThPluHSgHJImYReAZby8sLHxTt1uN7GgOYPVeAnwLDvqUk6wemCLNtBK+xcjv0HroTyL3KLuOjo5jHJBOq360bWer1C+VMGOeSdh1bAsA/mUAfcnsOvhRgDaydyUi5gpA/ejqSYatJMNuUaL7gOajOYPoDzZtPp+vgTzxj65frewIAYRuvYCn6t/pICCeZ+/eSuQ0xB3nuVO6Dc9d4wLUwAXovq43IRsnIB54r9dbV1FR8QvgXNhcwPk91JaCgoK3S0pK/u3p6VnDJec84wd1YIC/CvhXnAAv8xglgITXwL6Vm5q+8sNyvAXAoEwoBGFzWWQpALyN/Q+Iu6gLn8fomKPgZQ5jSRDwO5cCLxNS/ppv5n8BvxFJ6qICMVcYa4S40KIBwx0jESDhOzU1NYBvG5R/ABiSwwp/Y/2qdKpln0vmPwNAr9Jp7Qzyp+SKo7xDZEeLy8TbAS9X1QXwyMPxwMt8gJPb3zbEr6jqTH8PXRP7fSu3wXdTAV58MRIBrOh1VnP73Avnv/PPAqJd+smU/v7+R8vKyv5Oxta0jSkCxiBAXVR+Bvwzph116n1GkiDgF7I+oXsvkbNEi3z+KnimCaKGE9mmYsxIDsDRoHIWYP7e3t71qq+3nPBOMv419UP0bfQ9+ng6ZCMEsOrfac77wuHw54B7TOkEKPVj+ieUjraYRPm41k+LaCQHcAYo5dLzIwj0LfUH/cuQI5ec3cibYxC2sAVejdGlvGuEAPGaFT5GczoZBJDyLUfg/XIETsbeSRsjW0AcZDXP0JwEnPy7G7cwfpE/PvZlAnhx0lgEKMTRI/EJwv4FdHNJLkrKDfrnOATJFTljinECFDL+/HyE290T3A/c3PWHuAmOqTHbWgYsA5YBy4BlwDJgGbAMWAYsA5YBy4BlwDJgGUgnA/8BQPXvA8S58IMAAAAASUVORK5CYII=";

export default {
  rounderHeader,
  rounderFooter,
  divider,
  linkedinIcon,
  websiteIcon,
};