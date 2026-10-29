export default {
  multipass: false,
  floatPrecision: 1,
  js2svg: { pretty: true, indent: 1 },
  plugins: [
    { name: 'preset-default', params: { overrides: {
      cleanupIds: false, removeMetadata: false, removeDesc: false,
      collapseGroups: false, mergePaths: false, removeUnknownsAndDefaults: { keepDataAttrs: true, keepAriaAttrs: true, keepRoleAttr: true },
      convertPathData: { floatPrecision: 1, applyTransforms: true, applyTransformsStroked: true, makeArcs: false },
      convertShapeToPath: false, removeViewBox: false
    } } },
  ],
};
