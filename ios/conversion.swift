import CoreGraphics
import NitroModules

func convert(_ rect: CoreGraphics.CGRect) -> CGRect {
  CGRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height)
}

func convert(_ rect: CGRect) -> CoreGraphics.CGRect {
  .init(x: rect.x, y: rect.y, width: rect.width, height: rect.height)
}

